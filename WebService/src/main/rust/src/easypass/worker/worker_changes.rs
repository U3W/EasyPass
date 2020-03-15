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

impl Worker {
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
}