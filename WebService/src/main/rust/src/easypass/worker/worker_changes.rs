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
    pub async fn changes(self: Rc<Worker>, changes: JsValue) {
        // Get document
        let obj = Object::try_from(&changes).unwrap();
        let values = Object::values(&obj);
        console_log!("values: {:?}", &values);
        let doc = values.get(2);
        console_log!("doc: {:?}", &doc);
        let doc: Value = doc.into_serde::<Value>().unwrap();
        console_log!("doc-parsed: {:?}", &doc);

        /**
        let typ = doc["type"].as_str().unwrap();
        if typ == "cat" || typ == "passwd" {
            // private entry
            console_log!("CHANGES PRIVATE");
            if !doc["deleted"].is_null() {
                console_log!("NOT Deleted");
            } else {
                console_log!("DELETED");
            }
        } else if typ == "group-cat" || typ == "group-passwd" {
            // group entry
            console_log!("CHANGES GROUP");
            if !doc["deleted"].is_null() {
                console_log!("NOT Deleted");
            } else {
                console_log!("DELETED");
            }
        } else {
            // meta
            console_log!("CHANGES META");
            if !doc["deleted"].is_null() {
                console_log!("NOT Deleted");
            } else {
                console_log!("DELETED");
            }
        }*/

        // TODO split changes into three closues: private - group - meta
        console_log!("TODO");
    }
}