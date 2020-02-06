#![feature(in_band_lifetimes)]

mod utils;

use wasm_bindgen::prelude::*;
mod easypass;
use easypass::easypass::*;
use easypass::timeout::*;
mod pouchdb;
use pouchdb::pouchdb::*;
use wasm_bindgen_futures::{spawn_local, future_to_promise};
use wasm_bindgen_futures::JsFuture;

use serde_json::{Value};
use js_sys::{Promise, Array, ArrayBuffer};
use serde::{Deserialize, Serialize};
use serde_json::json;
use wasm_bindgen::__rt::std::future::Future;
use wasm_bindgen::__rt::std::rc::Rc;
use wasm_bindgen::__rt::core::cell::RefCell;
use wasm_bindgen::__rt::std::sync::{Arc, Mutex, PoisonError};
use wasm_bindgen::JsCast;
use serde_json::value::Value::Bool;
use wasm_bindgen::__rt::std::collections::HashMap;

use web_sys::{MessageEvent};

extern crate rand;
use rand::Rng;
use wasm_bindgen::__rt::Ref;
use wasm_bindgen::__rt::core::borrow::{BorrowMut, Borrow};


#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;


#[wasm_bindgen]
extern {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    #[wasm_bindgen(js_name = postMessage)]
    fn post_message(message: &JsValue);

    #[wasm_bindgen(js_name = postMessage)]
    fn post_message_with_transfer(message: &JsValue, transfer: &JsValue);

    #[wasm_bindgen(js_name = sleep)]
    fn sleep(timeout: u64);

    #[wasm_bindgen(js_name = addEventListenerWorker)]
    fn add_message_listener(name: &str, closure: &Closure<dyn FnMut(MessageEvent)>);

    #[wasm_bindgen(js_name = removeEventListenerWorker)]
    fn remove_message_listener(name: &str, closure: &Closure<dyn FnMut(MessageEvent)>);
}

#[wasm_bindgen]
pub struct Backend {
    controller: Controller
}

pub struct Controller {
    data: Arc<Mutex<Data>>
}

pub struct Data {
    worker: Worker,
    init_closure: Option<Closure<dyn FnMut(MessageEvent)>>,
    main_closure: Option<Closure<dyn FnMut(MessageEvent)>>
}

#[wasm_bindgen]
impl Backend {

    #[wasm_bindgen(constructor)]
    pub fn new() -> Backend {
        Backend {
            controller: Controller::new()
        }
    }

    pub fn start(&mut self) {
        self.controller.start();
    }
}

impl Controller {
    pub fn new() -> Controller {
        let data = Data {
            worker: Worker::new(String::from("")),
            init_closure: None,
            main_closure: None
        };
        let data = Arc::new(Mutex::new(data));
        Controller {
            data
        }
    }

    pub fn start(&mut self) {

        let this_here = self.data.clone();
        let this_moved = self.data.clone();

        let closure = Closure::new(move |e: MessageEvent| {

            let mut this = this_moved.lock().unwrap();
            log("Received data!");

            log(&format!("WHAT!: {:?}", &e.data()));

            let check: String = e.data().as_string().unwrap();
            log(&format!("Check: {}", &check));

            if check == "initAck" {
                let init_closure = this.init_closure.as_ref().unwrap();
                remove_message_listener(&"message", init_closure);

                this.init_closure = None;

                let closure
                    = Controller::build_main_closure(this_moved.clone());

                add_message_listener(&"message", &closure);
                this.main_closure = Some(closure);

                Worker::all_docs_without_passwords(&this.worker.private.local.clone())
            }
        });

        add_message_listener(&"message", &closure);

        let mut this = this_here.lock().unwrap();
        this.init_closure = Some(closure);

        post_message(&JsValue::from("initDone"));

    }

    pub fn build_main_closure(data: Arc<Mutex<Data>>) -> Closure<dyn FnMut(MessageEvent)> {
        Closure::new(move |e: MessageEvent| {
            log("2");
            let this = data.lock().unwrap();
            let worker = &this.worker;
            let (cmd, data) = e.data().get_message();
            // TODO update worker to use Value instead of JsValue
            let data = JsValue::from_serde(&data).unwrap();

            log("Received data!");
            log(&format!("CMD: {} | DATA: {:?}", &cmd, &data));
            log(&format!("Hey!: {:?}", &e.data()));
            log(&format!("Hey!: {:?}", &this.worker.service_status.lock().unwrap()));
            match cmd.as_ref() {
                /**
                case 'unregister':
                mode = undefined;
                break;
                */
                "savePassword" => {
                    // await worker.save_password(data);
                    worker.save_password(data);
                }
                "updatePassword" => {
                    // await worker.update_password(data);
                    worker.update_password(data);
                }
                "deletePassword" => {
                    // await worker.delete_password(data);
                    worker.delete_password(data);
                }
                "undoDeletePassword" => {
                    // await worker.undo_delete_password(data);
                    worker.undo_delete_password(data);
                }
                "getPassword" | "getPasswordForUpdate" | "getPasswordToClipboard" |
                "getPasswordAndRedirect" => {
                    // const encrypted = (await worker.find({"selector":{"_id": data._id, "_rev": data._rev}})).docs[0];
                    // TODO call decryption
                    // const decrypted = encrypted;
                    // if (cmd === 'getPasswordAndRedirect') {
                    //    self.postMessage([cmd, {_id: decrypted._id, passwd: decrypted.passwd, url: data.url}]);
                    // } else self.postMessage([cmd, {_id: decrypted._id, passwd: decrypted.passwd}]);
                    // TODO This section is needs really, really a refactor
                    //  really
                    log("why?");
                    let why = data.into_serde::<Value>().unwrap();
                    log(&format!("{:?}", &why));
                    let action = JsFuture::from(worker.find(JsValue::from_serde(&json!({
                            "selector": {
                                "_id": why["_id"],
                                "_rev": why["_rev"],
                            }
                        })).unwrap()));
                    future_to_promise(async move {
                        let result_raw = action.await.unwrap();
                        let result_raw = result_raw.into_serde::<Value>().unwrap();
                        let result = &result_raw["docs"][0];
                        let back = if cmd == "getPasswordAndRedirect" {
                            JsValue::from_serde(&json!({
                                "_id": result["_id"],
                                "passwd": result["passwd"],
                                "url": result["url"]
                            })).unwrap()
                        } else {
                            JsValue::from_serde(&json!({
                                "_id": result["_id"],
                                "passwd": result["passwd"]
                            })).unwrap()
                        };
                        log(&format!("{:?}", &back));
                        post_message(&JsValue::from_serde(&json!([
                            cmd, back.into_serde::<Value>().unwrap()
                        ])).unwrap());
                        Ok(JsValue::from(true))
                    });

                }
                "saveCategory" => {
                    //  await worker.save_category(data);
                    worker.save_category(data);
                }
                "updateCategory" => {
                    // await worker.update_category(data);
                    worker.update_category(data);
                }
                "deleteCategories" => {
                    // await worker.delete_categories(data);
                    worker.delete_categories(Array::from(&data));
                }
                "undoDeleteCategories" => {
                    // await worker.undo_delete_categories(data);
                    worker.undo_delete_categories(Array::from(&data));
                }
                _ => {}
            }
        })
    }

}

trait Utils {
    fn get_message(&self) -> (String, Value);
}

impl Utils for JsValue {
    fn get_message(&self) -> (String, Value) {
        let mut raw: Vec<Value> = self.into_serde().unwrap();
        let data = raw.pop().unwrap();
        let cmd = String::from(raw.pop().unwrap().as_str().unwrap());
        (cmd, data)
    }
}

pub struct Worker {
    private: Connection,
    service_status: Arc<Mutex<String>>,
    category_cache: Arc<Mutex<HashMap<String, RecoverCategory>>>,
    category_clear: Arc<Mutex<HashMap<u16, Timeout>>>,
    password_cache: Arc<Mutex<HashMap<String, RecoverPassword>>>,
    password_clear: Arc<Mutex<HashMap<u16, Timeout>>>
}

pub struct Connection {
    local: Arc<PouchDB>,
    remote: Option<PouchDB>,
    changes: Changes,
    sync: Option<Sync>
}

pub struct Changes {
    changes_feed: ChangesFeed,
    change: Closure<dyn FnMut(JsValue)>,
    error: Closure<dyn FnMut(JsValue)>
}

pub struct Sync {
    sync_handler: SyncHandler,
    change: Closure<dyn FnMut(JsValue)>,
    error: Closure<dyn FnMut(JsValue)>
}

impl Worker {
    /// Creates a new Worker that manages databases.
    /// This includes live syncing and methods for CRUD-operations.
    pub fn new(url: String) -> Worker {
        // Setup panic hook for better warnings
        utils::set_panic_hook();
        // Setup new local database for private password entries
        let settings = Settings { adapter: "idb".to_string() };
        let local
            = Arc::new(PouchDB::new("Local", &JsValue::from_serde(&settings).unwrap()));
        // Setup new remote database for private password entries
        // If offline, do not create remote connection
        let remote = if url.len() == 0 {
            None
        } else {
            Some(PouchDB::new_with_name(&url))
        };
        // Setup changes feed for database of private entries
        let changes_feed = local.changes();
        // Define functionality on database update
        // Send all documents to ui on change
        let local_copy = Arc::clone(&local);
        let change = Closure::new(move |val: JsValue| {
            log("We have a change!");
            Worker::all_docs_without_passwords(&local_copy);
        });
        // Define functionality on database error
        let error = Closure::new(move |val: JsValue| {
            log("EEEEEEEEEEEERRRRRRRRROOOOOOOOOOORRRRRRRRR!");
        });
        // Bind on change functions
        changes_feed.on_change(&change);
        changes_feed.on_error(&error);
        // Create struct that holds everything relevant to changes
        let changes = Changes {
            changes_feed,
            change,
            error
        };
        // Create struct that holds everything relevant to database of private entries
        let private = Connection {
            local,
            remote,
            changes,
            sync: None
        };
        // Create worker
        Worker {
            private,
            service_status: Arc::new(Mutex::new(String::from("online"))),
            category_cache: Arc::new(Mutex::new(HashMap::new())),
            category_clear: Arc::new(Mutex::new(HashMap::new())),
            password_cache: Arc::new(Mutex::new(HashMap::new())),
            password_clear: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Starts live replication for private password entries.
    pub fn heartbeat(&mut self) {
        // Establish remote connection and sync only when online
        if self.private.remote.is_some() {
            // Get Sync Handler
            let sync_handler: SyncHandler
                = self.private.local.sync(&self.private.remote.as_ref().unwrap());
            // Define functionality on change when syncing
            let service_status = Arc::clone(&self.service_status);
            let private_db = Arc::clone(&self.private.local);
            let change_closure = Closure::new(move |val: JsValue| {
                log("Sync Change!");
                // Worker::all_docs_without_passwords(&private_db);
            });
            // Define functionality on error when syncing
            let service_status = Arc::clone(&self.service_status);
            let error_closure = Closure::new(move |val: JsValue| {
                log(&format!("Error {:?}", &val));
                log(&format!("Error!! {}", &service_status.lock().unwrap()));
            });
            // Bind on change functions
            sync_handler.on_change(&change_closure);
            sync_handler.on_error(&error_closure);
            // Create struct that holds everything relevant to syncing
            let sync = Sync {
                sync_handler,
                change: change_closure,
                error: error_closure
            };
            // And add it to the Worker
            self.private.sync = Some(sync);
        }
        // Fetch all current docs and send result to UI
        Worker::all_docs_without_passwords(&self.private.local);
    }

    fn build_and_post_message(cmd: &str, data: JsValue) {
        let msg = Array::new_with_length(2);
        msg.set(0, JsValue::from_str(cmd));
        // TODO error handling
        msg.set(1, data);
        post_message(&msg);
    }

    fn all_docs_without_passwords(db: &PouchDB) {
        let action = JsFuture::from(db.all_docs_without_passwords());
        let _ = future_to_promise(async move {
            let result = action.await;
            let msg = Array::new_with_length(2);
            msg.set(0, JsValue::from_str("allEntries"));
            // TODO error handling
            msg.set(1, result.unwrap());
            post_message(&msg);
            Ok(JsValue::undefined())
        });
    }

    pub fn save_password(&self, data: JsValue) -> Promise {
        // TODO Worker Decrypt Password
        let private_db = Arc::clone(&self.private.local);
        let action = JsFuture::from(private_db.post(&data));
        future_to_promise(async move {
            let result = action.await;
            Worker::build_and_post_message("savePassword", result.unwrap());
            Ok(JsValue::from(true))
        })
    }

    pub fn update_password(&self, data: JsValue) -> Promise {
        let private_db = Arc::clone(&self.private.local);
        let action = JsFuture::from(private_db.put(&data));
        future_to_promise(async move {
            let result = action.await;
            Worker::build_and_post_message("updatePassword", result.unwrap());
            Ok(JsValue::from(true))
        })
    }

    pub fn delete_password(&self, data: JsValue) -> Promise {
        // Bind private database and cache for deleted password entries
        let private_db = Arc::clone(&self.private.local);
        let cache = Arc::clone(&self.password_cache);
        // Clear that stores deletion routines is needed two times (in- and outside of closure)
        let mut clear = Arc::clone(&self.password_clear);
        let mut this_clear = Arc::clone(&self.password_clear);
        // Parse received password entry
        let mut entry: Value = data.into_serde().unwrap();
        // Move values to promise, allows usage of async
        future_to_promise(async move {
            // Stores id of password entry that is used to get fully and later for deletion
            let id = String::from(entry["_id"].as_str().unwrap());
            // Get revision which is needed for deletion
            let rev = JsValue::from_serde(&entry["_rev"]).unwrap();
            // Use closure to drop cache lock after insert
            {
                // Get full entry for backup
                let backup_raw
                    = JsFuture::from(private_db.get(&id)).await.unwrap();
                // Lock and get full backup data
                let mut cache
                    = cache.lock().unwrap_or_else(PoisonError::into_inner);
                let recovery = RecoverPassword::new(&backup_raw);
                log(&format!("RECOVERY: {:?}", &recovery));
                // Add full password entry to password cache
                cache.insert(
                    String::from(&id),
                    recovery
                );
            }
            // Delete password entry and post result
            let action
                = JsFuture::from(private_db.remove(&JsValue::from(&id), &rev));
            let result = action.await;
            Worker::build_and_post_message("deletePassword", result.unwrap());

            // Delete password entry after a timeout
            // Get hashmap which stores deletion routines (closures)
            let mut clear
                = clear.lock().unwrap_or_else(PoisonError::into_inner);
            // Generate id for new routine
            let mut rng = rand::thread_rng();
            let mut closure_id: u16 = rng.gen_range(0, 200);
            if clear.contains_key(&closure_id) {
                closure_id = rng.gen_range(0, 200);
            }
            // Clone it for later use in closure
            let this_closure_id = closure_id.clone();
            // Generate closure and add to hashmap
            clear.insert(
                closure_id,
                Timeout::new(move || {
                    // Get hashmap that stores all routines
                    let mut clear
                        = this_clear.lock().unwrap_or_else(PoisonError::into_inner);
                    // Lock and get backup data
                    let mut cache
                        = cache.lock().unwrap_or_else(PoisonError::into_inner);
                    log(&format!("B. Cache {:?}", &cache));
                    // Perform deletion
                    if cache.contains_key(&id) {
                        cache.remove(&id);
                    }
                    log(&format!("A. Cache {:?}", &cache));
                    // Remove this routine
                    clear.remove(&this_closure_id);
                    log(&format!("Clear-Length {}", &clear.len()));
                }, 7500));
            Ok(JsValue::from(true))
        })
    }

    pub fn undo_delete_password(&self, data: JsValue) -> Promise {
        // Bind private database and cache for deleted password entries
        let private_db = Arc::clone(&self.private.local);
        let cache = Arc::clone(&self.password_cache);
        // Parse received password entry
        let mut entry: Value = data.into_serde().unwrap();
        // Move values to promise, allows usage of async
        future_to_promise(async move {
            // Lock and get full backup data
            let mut cache
                = cache.lock().unwrap_or_else(PoisonError::into_inner);
            // Get id of entry to recover
            let id = String::from(entry["_id"].as_str().unwrap());
            // Check if cache still contains this password entry
            // If yes, do recover
            if cache.contains_key(&id) {
                // Get entry backup data
                let mut recovery = cache.remove(&id).unwrap();
                // If entry is mapped to a category, check if mapped category exists
                let cat_id = recovery.get_cat_id();
                if cat_id != "0" {
                    log(&format!("CATID: {}", &cat_id));
                    let result = JsFuture::from(private_db.get(&cat_id)).await;
                    // If not, map category to default value
                    if result.is_err() {
                        //let result = result.into_serde::<Value>().unwrap();
                        //log(&format!("Category-Fetch: {:?}", &result));
                        log("Here!");
                        recovery.set_cat_id(String::from("0"));
                    }
                }
                // Save password entry again
                let insert = recovery.get_password_as_json();
                log(&format!("New Insert: {:?}", &insert));
                let _ = JsFuture::from(private_db.post(&insert)).await.unwrap();
            }
            Ok(JsValue::from(true))
        })
    }

    pub fn save_category(&self, data: JsValue) -> Promise {
        // TODO Worker Decrypt Password
        let private_db = Arc::clone(&self.private.local);
        let action = JsFuture::from(private_db.post(&data));
        future_to_promise(async move {
            let result = action.await;
            Worker::build_and_post_message("saveCategory", result.unwrap());
            Ok(JsValue::from(true))
        })
    }

    pub fn update_category(&self, data: JsValue) -> Promise {
        let private_db = Arc::clone(&self.private.local);
        let action = JsFuture::from(private_db.put(&data));
        future_to_promise(async move {
            let result = action.await;
            Worker::build_and_post_message("updateCategory", result.unwrap());
            Ok(JsValue::from(true))
        })
    }

    pub fn delete_categories(&self, categories: Array) -> Promise {
        // Bind private database and cache for deleted password entries
        let private_db = Arc::clone(&self.private.local);
        let mut cache = Arc::clone(&self.category_cache);
        // Clear that stores deletion routines is needed two times (in- and outside of closure)
        let mut clear = Arc::clone(&self.category_clear);
        let mut this_clear = Arc::clone(&self.category_clear);
        // Parse received categories as vec
        let mut categories: Vec<Value> = categories.into_serde().unwrap();
        // This variable will be used to store the categories that need to be deleted
        let query = Array::new_with_length(categories.len() as u32);
        // Move values to promise, allows usage of async
        future_to_promise(async move {
            // Stores received category ids that need to be deleted later on
            let mut clear_ids = Vec::new();
            // Enumerate over received categories
            for (i, cat) in categories.iter_mut().enumerate() {
                let mut cache
                    = cache.lock().unwrap_or_else(PoisonError::into_inner);
                // Add "_deleted" tag for later bulk operation that deletes this category
                cat["_deleted"] = Bool(true);
                // Get full category entry, is needed for proper undo of deletion
                let backup_raw
                    = JsFuture::from(private_db.get(cat["_id"].as_str().unwrap())).await.unwrap();
                let backup = Category::new(&backup_raw);
                // Get password entries associated with this category
                let entries_raw
                    = JsFuture::from(private_db.
                        all_entries_from_category(cat["_id"].as_str().unwrap())).await.unwrap();
                // TODO proper error handling
                if !entries_raw.is_undefined() {
                    // Push ids and revisions of password entries to a vec with tuples
                    let entries_parsed = Array::from(&entries_raw);
                    let mut entries: Vec<String> = Vec::new();
                    // If there are any entries
                    if entries_parsed.length() != 0 {
                        // Update all their category ids
                        let _ = JsFuture::from(private_db
                            .reset_category_in_entries(&entries_raw)).await.unwrap();
                        // Save them as backup
                        for entry in entries_parsed.iter() {
                            let entry = entry.into_serde::<Value>().unwrap();
                            entries.push(String::from(entry["_id"].as_str().unwrap()));
                        }
                    }
                    // Add full category entry and associated entries to category cache
                    clear_ids.push(String::from(cat["_id"].as_str().unwrap()));
                    cache.insert(
                        String::from(cat["_id"].as_str().unwrap()),
                        RecoverCategory::new(backup, entries)
                    );
                } else {
                    log("Something went wrong...");
                }
                // Category entry to deletion query
                query.set(i as u32, JsValue::from_serde(&cat).unwrap());
            }
            // Delete categories and post result
            let action = JsFuture::from(private_db.bulk_docs(&query));
            let result = action.await;
            Worker::build_and_post_message("deleteCategories", result.unwrap());

            // Delete category cache after a timeout
            // Get hashmap which stores deletion routines (closures)
            let mut clear
                = clear.lock().unwrap_or_else(PoisonError::into_inner);
            // Generate id for new routine
            let mut rng = rand::thread_rng();
            let mut closure_id: u16 = rng.gen_range(0, 200);
            if clear.contains_key(&closure_id) {
                closure_id = rng.gen_range(0, 200);
            }
            // Clone it for later use in closure
            let this_closure_id = closure_id.clone();
            // Generate closure and add to hashmap
            clear.insert(
                closure_id,
                Timeout::new(move || {
                    // Get hashmap that stores all routines
                    let mut clear
                        = this_clear.lock().unwrap_or_else(PoisonError::into_inner);
                    // Fixes: "cannot move out of `this_clear_ids`, a captured variable in an
                    // `FnMut` closure" error
                    let mut clear_ids = clear_ids.to_vec();
                    // Lock and get backup data
                    let mut cache
                        = cache.lock().unwrap_or_else(PoisonError::into_inner);
                    // Perform deletion
                    for category in clear_ids.into_iter() {
                        if cache.contains_key(&category) {
                            cache.remove(&category);
                        }
                    }
                    // Remove this routine
                    clear.remove(&this_closure_id);
                }, 7500));
            Ok(JsValue::from(true))
        })
    }


    pub fn undo_delete_categories(&self, categories: Array) -> Promise {
        // Bind private database and cache for deleted password entries
        let private_db = Arc::clone(&self.private.local);
        let cache = Arc::clone(&self.category_cache);
        // Convert received category data to vec
        let categories: Vec<Value> = categories.into_serde().unwrap();
        // Move values to promise, allows usage of async
        future_to_promise(async move {
            // Iterate over received categories that should be recovered
            for category in categories {
                // Lock and get full backup data
                let mut cache
                    = cache.lock().unwrap_or_else(PoisonError::into_inner);
                // Get id of entry to recover
                let cat_id = String::from(category["_id"].as_str().unwrap());
                // Check if cache still contains this category entry
                if cache.contains_key(&cat_id) {
                    // Get entry backup data
                    let recovery = cache.remove(&cat_id).unwrap();
                    // Save category again
                    let insert = recovery.get_category_as_json();
                    let result =
                        JsFuture::from(private_db.post(&insert)).await.unwrap();
                    let result = result.into_serde::<Value>().unwrap();
                    // Get the new id of the category
                    let new_id = result["id"].as_str().unwrap();
                    // Get password entries that were previously mapped to this category
                    let entries = recovery.get_entries();
                    // If they are not mapped to a new category already, map them to
                    // the recovered one
                    for entry in entries {
                        let result = JsFuture::from(private_db.get(&entry)).await.unwrap();
                        let mut result = result.into_serde::<Value>().unwrap();
                        // Check if document exists and if their not mapped to new category
                        if result["_id"].is_string() && result["catID"].as_str().unwrap() == "0" {
                            result["catID"] = Value::String(String::from(new_id));
                            let _ = JsFuture::from(private_db.
                                put(&JsValue::from_serde(&result).unwrap())).await;
                        }
                    }
                }
            }
            Ok(JsValue::from(true))
        })
    }

    pub fn find(&self, data: JsValue) -> Promise {
        let private_db = Arc::clone(&self.private.local);
        let action = JsFuture::from(private_db.find(&data));
        future_to_promise(async move {
            action.await
        })
    }

    pub fn all_docs(&self) -> Promise {
        let private_db = Arc::clone(&self.private.local);
        let action = JsFuture::from(private_db.all_docs_included());
        future_to_promise(async move {
            action.await
        })
    }

    pub fn remove_with_element(&self, data: JsValue) -> Promise {
        let private_db = Arc::clone(&self.private.local);
        let action = JsFuture::from(private_db.remove_with_element(&data));
        future_to_promise(async move {
            action.await
        })
    }

    pub fn remove(&self, doc_id: JsValue, doc_rev: JsValue) -> Promise {
        let private_db = Arc::clone(&self.private.local);
        let action = JsFuture::from(private_db.remove(&doc_id, &doc_rev));
        future_to_promise(async move {
            action.await
        })
    }
}







