use crate::easypass::worker::Worker;
use crate::easypass::worker::worker_crud::*;
use crate::{post_message, log};
use crate::easypass::timeout::Timeout;
use crate::easypass::recovery::{RecoverPassword, Category, RecoverCategory};

extern crate rand;
use rand::Rng;

use wasm_bindgen::__rt::std::rc::Rc;
use wasm_bindgen_futures::JsFuture;
use wasm_bindgen_futures::future_to_promise;
use wasm_bindgen::JsValue;
use js_sys::{Promise, Array, ArrayBuffer};
use serde_json::json;
use serde_json::Value;
use serde_json::value::Value::Bool;


impl Worker {
    pub async fn private_entries_without_passwords(self: Rc<Worker>) {
        let action
            = JsFuture::from(self.private.borrow().as_ref().unwrap().local_db.all_docs_without_passwords());
        let result = action.await;
        match result {
            Ok(result) => {
                let data = Array::new_with_length(2);
                data.set(0, JsValue::from_str("private"));
                data.set(1, result);
                Worker::build_and_post_message("allEntries", JsValue::from(data));
            },
            Err(e) => {
                console_log!("SEND ERROR {:?}", e);
            }
        }
    }

    pub async fn save_private_password(self: Rc<Worker>, data: JsValue) {
        self.save_password(CRUDType::Private, None, data).await;
    }

    pub async fn update_private_password(self: Rc<Worker>, data: JsValue) {
        self.update_password(CRUDType::Private, None, data).await;
    }

    pub async fn delete_private_password(self: Rc<Worker>, data: JsValue) {
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

    pub async fn undo_delete_private_password(self: Rc<Worker>, data: JsValue) {
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

    pub async fn save_private_category(self: Rc<Worker>, data: JsValue) {
        // TODO Worker Decrypt Password
        let result
            = JsFuture::from(self.private.borrow().as_ref().unwrap().local_db.post(&data)).await;
        Worker::build_and_post_message("saveCategory", result.unwrap());
    }

    pub async fn update_private_category(self: Rc<Worker>, data: JsValue) {
        let result
            = JsFuture::from(self.private.borrow().as_ref().unwrap().local_db.put(&data)).await;
        Worker::build_and_post_message("updateCategory", result.unwrap());
    }

    pub async fn delete_private_categories(self: Rc<Worker>, categories: JsValue) {
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

    pub async fn undo_delete_private_categories(self: Rc<Worker>, categories: JsValue) {
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

    pub async fn get_private_password(self: Rc<Worker>, cmd: String, data: JsValue) {
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
}