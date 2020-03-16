use crate::easypass::worker::Worker;
use crate::{post_message, log};
use crate::easypass::timeout::Timeout;
use crate::easypass::recovery::{RecoverPassword, Category, RecoverCategory};

use wasm_bindgen::__rt::std::rc::Rc;
use wasm_bindgen_futures::JsFuture;
use wasm_bindgen_futures::future_to_promise;
use wasm_bindgen::JsValue;
use js_sys::{Promise, Object, Array, ArrayBuffer};
use serde_json::json;
use serde_json::Value;
use serde_json::value::Value::Bool;
use crate::easypass::worker::worker_crud::CRUDType;

impl Worker {

    /// Handles changes on private database
    pub async fn private_changes(self: Rc<Worker>, changes: JsValue) {
        // Get document
        let obj = Object::try_from(&changes).unwrap();
        let values = Object::values(&obj);
        console_log!("values: {:?}", &values);
        let doc = values.get(2);
        console_log!("doc: {:?}", &doc);
        let doc: Value = doc.into_serde::<Value>().unwrap();
        console_log!("doc-parsed: {:?}", &doc);

        if doc["_deleted"].is_null() {
            // New document was added or existing document was updated
            // TODO @Moritz decrypt document
            let data = Array::new_with_length(2);
            data.set(0, JsValue::from_str("private"));
            data.set(1, JsValue::from_serde(&doc).unwrap());
            Worker::build_and_post_message("setEntry", JsValue::from(data));
        } else {
            // Existing document was deleted
            let data = Array::new_with_length(2);
            data.set(0, JsValue::from_str("private"));
            data.set(1, JsValue::from_str(doc["_id"].as_str().unwrap()));
            Worker::build_and_post_message("removeEntry", JsValue::from(data));
        }
    }

    /// Handles changes on meta database
    pub async fn meta_changes(self: Rc<Worker>, changes: JsValue) {
        // Get document
        let obj = Object::try_from(&changes).unwrap();
        let values = Object::values(&obj);
        console_log!("values: {:?}", &values);
        let doc = values.get(2);
        console_log!("doc: {:?}", &doc);
        let doc: Value = doc.into_serde::<Value>().unwrap();
        console_log!("doc-parsed: {:?}", &doc);

        let id = String::from(doc["_id"].as_str().unwrap());

        if doc["_deleted"].is_null() {
            // Check if group was added
            if doc["type"].as_str().unwrap() == "group" {
                // Build new group connection
                let connection
                    = self.clone().build_connection(CRUDType::Private, Some(id.clone()));
                // Add it to hashmap
                self.groups.borrow_mut().insert(id, connection);
                // TODO @Kacper add keys to storage

                console_log!("mygroups: {:?}", &self.groups.borrow().len());

                // TODO @Kacper send result to UI

            }
        } else {
            // Check if a group was deleted
            if self.groups.borrow().contains_key(&id) {
                // If yes, stop sync and remove it
                let mut groups = self.groups.borrow_mut();
                let connection = groups.remove(&id).unwrap();
                connection.changes_feed.cancel_changes();
                if connection.sync_handler.is_some() {
                    connection.sync_handler.as_ref().unwrap().cancel_sync();
                }
            }
        }
    }
}