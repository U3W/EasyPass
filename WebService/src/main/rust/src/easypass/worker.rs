
use crate::easypass::easypass::*;
use crate::easypass::timeout::*;
use crate::pouchdb::pouchdb::*;
use crate::is_online;

use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::{spawn_local, future_to_promise};
use wasm_bindgen_futures::JsFuture;
use wasm_bindgen::__rt::std::future::Future;
use wasm_bindgen::__rt::std::rc::Rc;
use wasm_bindgen::__rt::core::cell::{RefCell, Ref};
use wasm_bindgen::__rt::std::sync::{Arc, Mutex, PoisonError};
use wasm_bindgen::__rt::std::collections::HashMap;
use js_sys::{Promise, Array, ArrayBuffer};
use web_sys::{MessageEvent};
use serde::{Deserialize, Serialize};
use serde_json::json;
use serde_json::{Value};
use serde_json::value::Value::Bool;

extern crate rand;
use rand::Rng;


// Add other modules that define Worker functionality
// Allows to split Worker logic
mod worker_login;
mod worker_events;


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

    #[wasm_bindgen(js_name = getDatabaseURL)]
    fn get_database_url() -> Promise;

    #[wasm_bindgen(js_name = getNodeMode)]
    fn get_node_mode() -> String;
}

/// Manages databases and performs CRUD-operations.
pub struct Worker {
    user: RefCell<Option<String>>,
    mkey: RefCell<Option<String>>,
    meta: RefCell<Option<Connection>>,
    private: RefCell<Option<Connection>>,
    closures: RefCell<Option<ClosureStorage>>,
    service_status: RefCell<String>,
    service_closure: RefCell<Option<Closure<dyn FnMut()>>>,
    database_url: RefCell<Option<String>>,
    category_cache: RefCell<HashMap<String, RecoverCategory>>,
    category_clear: RefCell<HashMap<u16, Timeout>>,
    password_cache: RefCell<HashMap<String, RecoverPassword>>,
    password_clear: RefCell<HashMap<u16, Timeout>>,
}

/// Holds one logical databases with references to the local and remote one.
/// Also, contains the changes-feed and sync-handler.
struct Connection {
    local_db: PouchDB,
    remote_db: Option<PouchDB>,
    changes_feed: ChangesFeed,
    sync_handler: Option<SyncHandler>
}

/// Holds all database-relevant closures used by the Worker
/// Change closures are called, when somethings changes in the local database.
/// Sync closures are called, when synchronization happens between local and
/// remote database.
struct ClosureStorage {
    change_closure: Closure<dyn FnMut(JsValue)>,
    change_error_closure: Closure<dyn FnMut(JsValue)>,
    sync_closure: Closure<dyn FnMut(JsValue)>,
    sync_error_closure: Closure<dyn FnMut(JsValue)>,
    meta_closure: Closure<dyn FnMut(JsValue)>
}

impl Worker {
    /// Creates a new Worker that manages databases.
    /// This includes live syncing and methods for CRUD-operations.
    pub fn new(url: String) -> Rc<Worker> {
        // TODO is url needed? Init is done later...
        // User hash and masterkey are not known at initialization
        let user = RefCell::new(None);
        let mkey = RefCell::new(None);
        // Databases will be setup later on
        let meta = RefCell::new(None);
        let private = RefCell::new(None);
        // Create worker with reference counting to enable its usage
        // in multiple parts in the application
        let worker = Rc::new(Worker {
            user,
            mkey,
            meta,
            private,
            closures: RefCell::new(None),
            service_status: RefCell::new(String::from("offline")),
            service_closure: RefCell::new(None),
            database_url: RefCell::new(None),
            category_cache: RefCell::new(HashMap::new()),
            category_clear: RefCell::new(HashMap::new()),
            password_cache: RefCell::new(HashMap::new()),
            password_clear: RefCell::new(HashMap::new()),
        });
        // Return reference counted worker
        worker
    }

    pub async fn init(self: Rc<Worker>) {
        log("init");
        log(&get_node_mode());

        if is_online() {
            let worker = self.clone();
            let result = JsFuture::from(get_database_url()).await;
            match result {
                Ok(url_raw) => {
                    let url = url_raw.as_string().unwrap();
                    log(&format!("My URL!! {}", &url));
                    worker.database_url.replace(Some(url));
                    worker.service_status.replace(String::from("online"));
                }
                Err(_) => {
                    // TODO interval that checks if service is available again
                    log("down");
                    worker.service_status.replace(String::from("down"));
                }
            }
        } else {
            log("offline");
            self.service_status.replace(String::from("offline"));
        }
    }

    /// Starts live replication for private password entries.
    pub async fn hearbeat(self: Rc<Worker>) {
        // With the reference to the Worker the functionality for
        // database events can be defined through closures
        //
        // Define functionality for local changes
        let worker_moved_change = self.clone();
        let change_closure = Closure::new(move |val: JsValue| {
            let worker = worker_moved_change.clone();
            spawn_local(async move {
                //let worker = &worker_moved_change;
                log("We have a change!");
                // Send all documents to ui on change
                worker.clone().all_docs_without_passwords();
            });
        });
        // Define functionality for error cases on local changes
        let worker_moved_error = self.clone();
        let change_error_closure = Closure::new(move |val: JsValue| {
            let worker = &worker_moved_error;
            log("EEEEEEEEEEEERRRRRRRRROOOOOOOOOOORRRRRRRRR!");
        });
        // Define functionality for remote-sync changes
        let sync_closure = Closure::new(move |val: JsValue| {
            log("Sync Change!");
        });
        // Define functionality for error cases on remote changes
        let sync_error_closure = Closure::new(move |val: JsValue| {
            log(&format!("Error {:?}", &val));
        });
        // Define functionality for on change on meta database
        let meta_closure = Closure::new(move |val: JsValue| {
            log("META CHANGE!");
        });

        // Define databases
        //
        // Setup meta database
        let meta
            = self.build_connection(String::from("meta"),
        &meta_closure, &change_error_closure,
        &sync_closure, &sync_error_closure);

        // Check/Write meta-data
        let user = String::from(self.user.borrow().as_ref().unwrap().as_str());
        let mkey = String::from(self.mkey.borrow().as_ref().unwrap().as_str());
        Worker::write_meta_data(&meta.local_db, user, mkey).await;

        // Add it to the worker
        let meta = Some(meta);
        self.meta.replace(meta);

        // Setup database for private password entries
        let private
            = self.build_connection(String::from("local"),
        &change_closure, &change_error_closure,
        &sync_closure, &sync_error_closure);
        // Add it to the worker
        let private = Some(private);
        self.private.replace(private);

        // Create struct that holds all database relevant closures
        let closures = Some(ClosureStorage {
            change_closure,
            change_error_closure,
            sync_closure,
            sync_error_closure,
            meta_closure
        });
        self.closures.replace(closures);

        // Send all password entries to UI
        self.clone().all_docs_without_passwords();
    }

    /// Setups local and remote database and returns them as one Connection struct.
    /// Also, binds on change events of the database to the given closures.
    fn build_connection(
        &self, name: String,
        change: &Closure<dyn FnMut(JsValue)>, change_error: &Closure<dyn FnMut(JsValue)>,
        sync: &Closure<dyn FnMut(JsValue)>, sync_error: &Closure<dyn FnMut(JsValue)>
    ) -> Connection {
        // Setup local database
        let settings = Settings { adapter: "idb".to_string() };
        let local_db_name = &format!("{}-{}", self.user.borrow().as_ref().unwrap(), &name);
        let local_db = PouchDB::new(local_db_name, &JsValue::from_serde(&settings).unwrap());
        // Setup changes feed for database
        let changes_feed = local_db.changes();
        // On change functions need to be bound to the changes feed
        changes_feed.on_change(change);
        changes_feed.on_error(change_error);
        // Create variable that contains the remote database or none
        let mut remote_db = None;
        // When online, setup remote database and sync handler
        let sync_handler = if self.service_status.borrow().as_str() == "online" {
            // Init remote databases
            let remote_db_here = PouchDB::new_with_name(&format!("{}/-{}",
                 &self.database_url.borrow().as_ref().unwrap(), &name));
            // Get Sync Handler
            let sync_handler: SyncHandler = local_db.sync(&remote_db_here);
            // Bind on change functions
            sync_handler.on_change(sync);
            sync_handler.on_error(sync_error);
            // Save new remote database
            remote_db = Some(remote_db_here);
            // Return sync handler
            Some(sync_handler)
        } else {
            None
        };
        // Create struct that holds connection information and return it
        Connection {
            local_db,
            remote_db,
            changes_feed,
            sync_handler
        }
    }

    async fn write_meta_data(meta_db: &PouchDB, user: String, mkey: String) {
        // TODO refactor

        let result_raw = JsFuture::from(meta_db.find(&JsValue::from_serde(&json!({
            "selector": {
                "$or": [
                    {"type": "user"},
                    {"type": "mkey"}
                ]
            }
        })).unwrap())).await.unwrap();
        // Parse received entry
        let result_raw = result_raw.into_serde::<Value>().unwrap();
        let result_1 = &result_raw["docs"][0];
        let result_2 = &result_raw["docs"][1];
        console_log!("META1!: {:?}", &result_1);
        console_log!("META2!: {:?}", &result_2);

        let result = if result_1.is_null() && result_2.is_null() {
            // No meta data saved
            let meta_data = JsValue::from_serde(&json!([
                {"type": "mkey", "mkey": String::from(mkey)},
                {"type": "user", "user": String::from(user)}
            ])).unwrap();
            JsFuture::from(meta_db.bulk_docs(&meta_data)).await.unwrap()
        } else if result_1.is_object() && result_2.is_object() {
            // Both meta data is saved
            let meta_data = if result_1["mkey"].is_string() {
                // result_1 is mkey, result_2 is user
                JsValue::from_serde(&json!([
                    {"type": "mkey", "mkey": String::from(mkey),
                    "_id": result_1["_id"], "_rev": result_1["_rev"]},
                    {"type": "user", "user": String::from(user),
                    "_id": result_2["_id"], "_rev": result_2["_rev"]}
                ])).unwrap()
            } else {
                // result_1 is user, result_2 is mkey
                JsValue::from_serde(&json!([
                    {"type": "mkey", "mkey": String::from(mkey),
                    "_id": result_2["_id"], "_rev": result_2["_rev"]},
                    {"type": "user", "user": String::from(user),
                    "_id": result_1["_id"], "_rev": result_1["_rev"]}
                ])).unwrap()
            };
            JsFuture::from(meta_db.bulk_docs(&meta_data)).await.unwrap()
        } else if result_1.is_object() && result_2.is_null() {
            // One field is missing
            let meta_data = if result_1["mkey"].is_string() {
                // result_1 is mkey, user meta-data is missing
                JsValue::from_serde(&json!([
                    {"type": "mkey", "mkey": String::from(mkey),
                    "_id": result_1["_id"], "_rev": result_1["_rev"]},
                    {"type": "user", "user": String::from(user)}
                ])).unwrap()
            } else {
                // result_1 is user, mkey meta-data is missing
                JsValue::from_serde(&json!([
                    {"type": "mkey", "mkey": String::from(mkey)},
                    {"type": "user", "user": String::from(user),
                    "_id": result_1["_id"], "_rev": result_1["_rev"]}
                ])).unwrap()
            };
            JsFuture::from(meta_db.bulk_docs(&meta_data)).await.unwrap()
        } else {
            // Other filed is missing
            let meta_data = if result_2["mkey"].is_string() {
                // result_2 is mkey, user meta-data is missing
                JsValue::from_serde(&json!([
                    {"type": "mkey", "mkey": String::from(mkey),
                    "_id": result_2["_id"], "_rev": result_2["_rev"]},
                    {"type": "user", "user": String::from(user)}
                ])).unwrap()
            } else {
                // result_2 is user, mkey meta-data is missing
                JsValue::from_serde(&json!([
                    {"type": "mkey", "mkey": String::from(mkey)},
                    {"type": "user", "user": String::from(user),
                    "_id": result_2["_id"], "_rev": result_2["_rev"]}
                ])).unwrap()
            };
            JsFuture::from(meta_db.bulk_docs(&meta_data)).await.unwrap()
        };

        console_log!("Save result {:?}", &result);
    }

    fn build_and_post_message(cmd: &str, data: JsValue) {
        let msg = Array::new_with_length(2);
        msg.set(0, JsValue::from_str(cmd));
        // TODO error handling
        msg.set(1, data);
        post_message(&msg);
    }

    pub fn all_docs_without_passwords(self: Rc<Worker>) {
        let _ = future_to_promise(async move {
            console_log!("all here1");
            let action = JsFuture::from(self.private.borrow().as_ref().unwrap().local_db.all_docs_without_passwords());
            let result = action.await;
            console_log!("all here2");
            match result {
                Ok(data) => {
                    let msg = Array::new_with_length(2);
                    msg.set(0, JsValue::from_str("allEntries"));
                    // TODO error handling
                    msg.set(1, data);
                    post_message(&msg);
                },
                Err(e) => {
                    console_log!("SEND ERROR {:?}", e);
                }
            }
            Ok(JsValue::undefined())
        });
    }

    pub async fn save_password(self: Rc<Worker>, data: JsValue) {
        // TODO Worker Decrypt Password
        let result
            = JsFuture::from(self.private.borrow().as_ref().unwrap().local_db.post(&data)).await;
        Worker::build_and_post_message("savePassword", result.unwrap());
    }

    pub async fn update_password(self: Rc<Worker>, data: JsValue) {
        let result
            = JsFuture::from(self.private.borrow().as_ref().unwrap().local_db.put(&data)).await;
        Worker::build_and_post_message("updatePassword", result.unwrap());
    }

    pub async fn delete_password(self: Rc<Worker>, data: JsValue) {
        // Bind private database and cache for deleted password entries
        let private_db = self.get_private_local_db();
        let cache = &self.password_cache;
        // Clear is a hashmap which stores deletion routines (closures)
        let mut clear = self.password_clear.borrow_mut();
        // Parse received password entry
        let entry: Value = data.into_serde().unwrap();
        // Stores id of password entry that is used to get fully and later for deletion
        let id = String::from(entry["_id"].as_str().unwrap());
        // Get revision which is needed for deletion
        let rev = JsValue::from_serde(&entry["_rev"]).unwrap();
        // Use closure to drop cache lock after insert
        {
            // Get full entry for backup
            let backup_raw
                = JsFuture::from(private_db.get(&id)).await.unwrap();
            let recovery = RecoverPassword::new(&backup_raw);
            log(&format!("RECOVERY: {:?}", &recovery));
            // Add full password entry to password cache
            cache.borrow_mut().insert(
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
        // Generate id for new routine
        let mut rng = rand::thread_rng();
        let mut closure_id: u16 = rng.gen_range(0, 200);
        if clear.contains_key(&closure_id) {
            closure_id = rng.gen_range(0, 200);
        }
        // Clone it for later use in closure
        let this_closure_id = closure_id.clone();
        // Clone state to move it to closure
        let worker = self.clone();
        // Generate closure and add to hashmap
        clear.insert(
            closure_id,
            Timeout::new(move || {
                // Get hashmap that stores all routines
                let mut clear
                    = worker.password_clear.borrow_mut();
                // Get backup data
                let mut cache
                    = worker.password_cache.borrow_mut();
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
    }

    pub async fn undo_delete_password(self: Rc<Worker>, data: JsValue) {
        // Bind private database
        let private_db = self.get_private_local_db();
        // Get full backup data
        let mut cache = self.password_cache.borrow_mut();
        // Parse received password entry
        let entry: Value = data.into_serde().unwrap();
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
    }

    pub async fn save_category(self: Rc<Worker>, data: JsValue) {
        // TODO Worker Decrypt Password
        let result
            = JsFuture::from(self.private.borrow().as_ref().unwrap().local_db.post(&data)).await;
        Worker::build_and_post_message("saveCategory", result.unwrap());
    }

    pub async fn update_category(self: Rc<Worker>, data: JsValue) {
        let result
            = JsFuture::from(self.private.borrow().as_ref().unwrap().local_db.put(&data)).await;
        Worker::build_and_post_message("updateCategory", result.unwrap());
    }

    pub async fn delete_categories(self: Rc<Worker>, categories: JsValue) {
        // Convert JsValue to Array, that its truly is
        let categories = Array::from(&categories);
        // Bind private database and cache for deleted password entries
        let private_db = self.get_private_local_db();
        let mut cache = self.category_cache.borrow_mut();
        // Clear is a hashmap which stores deletion routines (closures)
        let mut clear = self.category_clear.borrow_mut();
        // Parse received categories as vec
        let mut categories: Vec<Value> = categories.into_serde().unwrap();
        // This variable will be used to store the categories that need to be deleted
        let query = Array::new_with_length(categories.len() as u32);
        // Stores received category ids that need to be deleted later on
        let mut clear_ids = Vec::new();
        // Enumerate over received categories
        for (i, cat) in categories.iter_mut().enumerate() {
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
        // Generate id for new routine
        let mut rng = rand::thread_rng();
        let mut closure_id: u16 = rng.gen_range(0, 200);
        if clear.contains_key(&closure_id) {
            closure_id = rng.gen_range(0, 200);
        }
        // Clone it for later use in closure
        let this_closure_id = closure_id.clone();
        // Clone state to move it to closure
        let worker = self.clone();
        // Generate closure and add to hashmap
        clear.insert(
            closure_id,
            Timeout::new(move || {
                // Get hashmap that stores all routines
                let mut clear = worker.category_clear.borrow_mut();
                // Fixes: "cannot move out of `this_clear_ids`, a captured variable in an
                // `FnMut` closure" error
                let clear_ids = clear_ids.to_vec();
                // Lock and get backup data
                let mut cache = worker.category_cache.borrow_mut();
                log(&format!("C. Cache {:?}", &cache));
                // Perform deletion
                for category in clear_ids.into_iter() {
                    if cache.contains_key(&category) {
                        cache.remove(&category);
                    }
                }
                // Remove this routine
                clear.remove(&this_closure_id);
                log(&format!("C. Cache-len {:?}", &cache.len()));
            }, 7500));
    }

    pub async fn undo_delete_categories(self: Rc<Worker>, categories: JsValue) {
        // Convert JsValue to Array, that its truly is
        let categories = Array::from(&categories);
        // Bind private database and cache for deleted password entries
        let private_db = self.get_private_local_db();
        let mut cache = self.category_cache.borrow_mut();
        // Convert received category data to vec
        let categories: Vec<Value> = categories.into_serde().unwrap();
        // Iterate over received categories that should be recovered
        for category in categories {
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
    }

    pub async fn get_password(self: Rc<Worker>, cmd: String, data: JsValue) {
        // Bind private database
        let private_db = self.get_private_local_db();
        // Parse data to make it readable from Rust
        let data_parsed = data.into_serde::<Value>().unwrap();
        // Search for received entry
        let action = JsFuture::from(private_db.find(&JsValue::from_serde(&json!({
            "selector": {
                "_id": data_parsed["_id"],
                "_rev": data_parsed["_rev"],
            }
        })).unwrap()));
        // Parse received entry
        let result_raw = action.await.unwrap();
        let result_raw = result_raw.into_serde::<Value>().unwrap();
        let result = &result_raw["docs"][0];
        // Prepare return value (dependant on command)
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
        // Post return value
        post_message(&JsValue::from_serde(
            &json!([cmd, back.into_serde::<Value>().unwrap()])
        ).unwrap());
    }

    pub fn find(self: Rc<Worker>, data: JsValue) -> Promise {
        future_to_promise(async move {
            JsFuture::from(self.private.borrow().as_ref().unwrap().local_db.find(&data)).await
        })
    }

    pub fn all_docs(self: Rc<Worker>) -> Promise {
        future_to_promise(async move {
            JsFuture::from(self.private.borrow().as_ref().unwrap().local_db.all_docs_included()).await
        })
    }

    pub fn remove_with_element(self: Rc<Worker>, data: JsValue) -> Promise {
        future_to_promise(async move {
            JsFuture::from(self.private.borrow().as_ref().unwrap().local_db.remove_with_element(&data)).await
        })
    }

    pub fn remove(self: Rc<Worker>, doc_id: JsValue, doc_rev: JsValue) -> Promise {
        future_to_promise(async move {
            JsFuture::from(self.private.borrow().as_ref().unwrap().local_db.remove(&doc_id, &doc_rev)).await
        })
    }
}

/// Functions that return or alter Worker state
impl Worker {

    /// Return a reference to the local database for private password entries
    pub fn get_private_local_db(&self) -> Ref<PouchDB> {
        let conn = self.private.borrow();
        Ref::map(conn, |t| {
          &t.as_ref().unwrap().local_db
        })
    }

    /// Returns service/network status of the app
    pub fn get_service_status(self: Rc<Worker>) -> RefCell<String> {
        self.service_status.clone()
    }
}
