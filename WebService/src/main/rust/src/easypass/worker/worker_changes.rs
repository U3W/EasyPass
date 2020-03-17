use crate::easypass::worker::Worker;
use crate::{log};
use crate::easypass::formats::CRUDType;
use crate::easypass::connection::Connection;

use wasm_bindgen::__rt::std::rc::Rc;
use wasm_bindgen::JsValue;
use js_sys::{Object, Array};
use serde_json::Value;


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
                let id = String::from(doc["_id"].as_str().unwrap());
                let gid = String::from(doc["gid"].as_str().unwrap());
                let gmk = String::from(doc["gmk"].as_str().unwrap());
                let amk = if !doc["amk"].is_null() {
                    Some(String::from(doc["amk"].as_str().unwrap()))
                } else {
                    None
                };

                self.clone().setup_new_group(id, gid, gmk, amk);

                console_log!("mygroups: {:?}", &self.groups.borrow().len());

                // TODO @Kacper send result to UI
                console_log!("group keys: {:?}", &self.group_keys.borrow());

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