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

extern crate rand;

use rand::Rng;


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
}

#[wasm_bindgen]
pub struct Worker {
    private: Connection,
    service_status: Arc<Mutex<String>>,
    category_cache: Arc<Mutex<HashMap<String, RecoverCategory>>>,
    category_clear: Arc<Mutex<HashMap<u16, Timeout>>>
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

#[wasm_bindgen]
impl Worker {

    /// Creates a new Worker that manages databases.
    /// This includes live syncing and methods for CRUD-operations.
    #[wasm_bindgen(constructor)]
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
            category_clear: Arc::new(Mutex::new(HashMap::new()))
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

    fn all_docs_without_passwords(db: &PouchDB) -> Promise {
        let action = JsFuture::from(db.all_docs_without_passwords());
        future_to_promise(async move {
            let result = action.await;
            let msg = Array::new_with_length(2);
            msg.set(0, JsValue::from_str("allEntries"));
            // TODO error handling
            msg.set(1, result.unwrap());
            post_message(&msg);
            Ok(JsValue::undefined())
        })
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
        // Cache is needed two times (in- and outside of closure)
        let mut clear = Arc::clone(&self.category_clear);
        let mut this_clear = Arc::clone(&self.category_clear);
        // Parse received categories as vec
        let mut categories: Vec<Value> = categories.into_serde().unwrap();
        // This variable will be used to store the categories that need to be delted
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
            let mut closure_id: u16 = rng.gen_range(0, 100);
            if clear.contains_key(&closure_id) {
                closure_id = rng.gen_range(0, 100);
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
        let mut cache = Arc::clone(&self.category_cache);
        // Convert received category data to vec
        let mut categories: Vec<Value> = categories.into_serde().unwrap();
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







