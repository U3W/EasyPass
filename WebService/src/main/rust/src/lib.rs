#![feature(in_band_lifetimes)]

mod utils;

use wasm_bindgen::prelude::*;
mod easypass;
use easypass::easypass::*;
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
use wasm_bindgen::__rt::std::sync::{Arc, Mutex};
use wasm_bindgen::JsCast;
use serde_json::value::Value::Bool;


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
    category_cache: Arc<Mutex<Vec<RecoverCategory>>>
}

pub struct Connection {
    local: Arc<Mutex<PouchDB>>,
    remote: Option<PouchDB>,
    sync: Option<Sync>
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
        utils::set_panic_hook();
        let settings = Settings { adapter: "idb".to_string() };
        log(&format!("Length: {}", url.len()));
        let remote = if url.len() == 0 {
            let temporary = Temporary { adapter: "idb".to_string(), skip_setup: true };
            Some(PouchDB::new("Temporary", &JsValue::from_serde(&temporary).unwrap()))
        } else {
            Some(PouchDB::new_with_name(&url))
        };
        let private = Connection {
            local: Arc::new(Mutex::new(
                PouchDB::new("Local", &JsValue::from_serde(&settings).unwrap()))),
            remote,
            sync: None
        };
        Worker {
            private,
            service_status: Arc::new(Mutex::new(String::from("online"))),
            category_cache: Arc::new(Mutex::new(Vec::new()))
        }
    }

    /// Starts live replication for private password entries.
    pub fn heartbeat(&mut self) {
        let sync_handler: SyncHandler
            = self.private.local.lock().unwrap().sync(&self.private.remote.as_ref().unwrap());

        let service_status = Arc::clone(&self.service_status);
        let private_db = Arc::clone(&self.private.local);
        let change_closure = Closure::new(move |val: JsValue| {
            log(&format!("Change {:?}", &val));
            log(&format!("Change!! {}", &service_status.lock().unwrap()));
            Worker::all_docs_without_passwords(&private_db.lock().unwrap());
        });

        let service_status = Arc::clone(&self.service_status);
        let error_closure = Closure::new(move |val: JsValue| {
            log(&format!("Error {:?}", &val));
            log(&format!("Error!! {}", &service_status.lock().unwrap()));
        });

        sync_handler.on_change(&change_closure);
        sync_handler.on_error(&error_closure);

        let sync = Sync {
            sync_handler,
            change: change_closure,
            error: error_closure
        };

        self.private.sync = Some(sync);

        Worker::all_docs_without_passwords(&self.private.local.lock().unwrap());
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
        let action = JsFuture::from(private_db.lock().unwrap().post(&data));
        future_to_promise(async move {
            let result = action.await;
            Worker::build_and_post_message("savePassword", result.unwrap());
            Ok(JsValue::from(true))
        })
    }

    pub fn update_password(&self, data: JsValue) -> Promise {
        let db = self.private.local.lock().unwrap();
        let action = JsFuture::from(db.put(&data));
        future_to_promise(async move {
            let result = action.await;
            Worker::build_and_post_message("updatePassword", result.unwrap());
            Ok(JsValue::from(true))
        })
    }

    pub fn save_category(&self, data: JsValue) -> Promise {
        // TODO Worker Decrypt Password
        let private_db = Arc::clone(&self.private.local);
        let action = JsFuture::from(private_db.lock().unwrap().post(&data));
        future_to_promise(async move {
            let result = action.await;
            Worker::build_and_post_message("saveCategory", result.unwrap());
            Ok(JsValue::from(true))
        })
    }

    pub fn update_category(&self, data: JsValue) -> Promise {
        let db = self.private.local.lock().unwrap();
        let action = JsFuture::from(db.put(&data));
        future_to_promise(async move {
            let result = action.await;
            Worker::build_and_post_message("updateCategory", result.unwrap());
            Ok(JsValue::from(true))
        })
    }

    pub fn delete_categories(&self, data: Array) -> Promise {
        // Bind private database and cache for deleted password entries
        let private_db = Arc::clone(&self.private.local);
        let mut cache = Arc::clone(&self.category_cache);
        // Parse received categories as vec
        let mut categories: Vec<Value> = data.into_serde().unwrap();
        // This variable will be used to store the categories that need to be delted
        let query = Array::new_with_length(categories.len() as u32);
        // Move values to promise, allows usage of async
        future_to_promise(async move {
            // Enumerate over received categories
            for (i, cat) in categories.iter_mut().enumerate() {
                // Add "_deleted" tag for later bulk operation that deletes this category
                cat["_deleted"] = Bool(true);
                // Get full category entry, is needed for proper undo of deletion
                let backup_raw
                    = JsFuture::from(private_db.lock().unwrap()
                        .get(cat["_id"].as_str().unwrap())).await.unwrap();
                let backup = Category::new(&backup_raw);
                // Get password entries associated with this category
                let entries_raw
                    = JsFuture::from(private_db.lock().unwrap()
                    .all_entries_from_category(cat["_id"].as_str().unwrap())).await.unwrap();
                // TODO proper error handling
                if !entries_raw.is_undefined() {
                    // Push ids and revisions of password entries to a vec with tuples
                    let entries_parsed = Array::from(&entries_raw);
                    let mut entries: Vec<String> = Vec::new();
                    // If there are any entries
                    if entries_parsed.length() != 0 {
                        // Update all their category ids
                        JsFuture::from(private_db.lock().unwrap()
                            .reset_category_in_entries(&entries_raw)).await;
                        // Save them as backup
                        for entry in entries_parsed.iter() {
                            let entry = entry.into_serde::<Value>().unwrap();
                            entries.push(String::from(entry["_id"].as_str().unwrap()));
                        }
                    }
                    // Add full category entry and associated entries to category cache
                    cache.lock().unwrap().push(RecoverCategory::new(backup, entries));
                } else {
                    log("Something went wrong...");
                }
                // Category entry to deletion query
                query.set(i as u32, JsValue::from_serde(&cat).unwrap());

            }
            // Delete categories and post result
            let action = JsFuture::from(private_db.lock().unwrap().bulk_docs(&query));
            let result = action.await;
            Worker::build_and_post_message("deleteCategories", result.unwrap());
            Ok(JsValue::from(true))
        })
    }

    pub fn undo_delete_categories(&self) -> Promise {
        // Bind private database and cache for deleted password entries
        let private_db = Arc::clone(&self.private.local);
        let mut cache = Arc::clone(&self.category_cache);
        log("MOi");
        future_to_promise(async move {
            if cache.lock().unwrap().len() > 0 {
                for recovery in cache.lock().unwrap().iter_mut() {
                    let insert = recovery.get_category_as_json();
                    let result =
                        JsFuture::from(private_db.lock().unwrap().post(&insert)).await.unwrap();
                    let result = result.into_serde::<Value>().unwrap();
                    log(&format!("RESULT: {:?}", &result));
                    let new_id = result["id"].as_str().unwrap();
                    let entries = recovery.get_entries();
                    /**JsFuture::from(
                        private_db.lock().unwrap()
                        .reset_entries_from_deleted_category(new_id, entries)).await;*/
                    let result: Vec<Value> = Vec::new();
                    for entry in entries {
                        let result = JsFuture::from(private_db.lock().unwrap().get(&entry)).await.unwrap();
                        let mut result = result.into_serde::<Value>().unwrap();
                        // Check if document exists and if their not mapped to new category
                        if result["_id"].is_string() && result["catID"].as_str().unwrap() == "0"{
                            result["catID"] = Value::String(String::from(new_id));
                            JsFuture::from(private_db.lock().unwrap().put(&JsValue::from_serde(&result).unwrap())).await;
                        }
                    }
                }
                cache.lock().unwrap().clear();
            }
            Ok(JsValue::from(true))
        })
    }

    pub fn find(&self, data: JsValue) -> Promise {
        let db = self.private.local.lock().unwrap();
        let action = JsFuture::from(db.find(&data));
        future_to_promise(async move {
            action.await
        })
    }

    pub fn all_docs(&self) -> Promise {
        let db = self.private.local.lock().unwrap();
        let action = JsFuture::from(db.all_docs_included());
        future_to_promise(async move {
            action.await
        })
    }

    pub fn remove_with_element(&self, data: JsValue) -> Promise {
        let db = self.private.local.lock().unwrap();
        let action = JsFuture::from(db.remove_with_element(&data));
        future_to_promise(async move {
            action.await
        })
    }

    pub fn remove(&self, doc_id: JsValue, doc_rev: JsValue) -> Promise {
        let db = self.private.local.lock().unwrap();
        let action = JsFuture::from(db.remove(&doc_id, &doc_rev));
        future_to_promise(async move {
            action.await
        })
    }
}







