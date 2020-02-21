use wasm_bindgen::prelude::*;
use wasm_bindgen::__rt::std::rc::Rc;
use js_sys::{Array, Object};
use web_sys::{FileReaderSync, Blob, File};
use serde_json::Value;
use crate::easypass::worker::Worker;
use crate::{post_message, log};

impl Worker {
    pub async fn login(self: Rc<Worker>, credentials: JsValue) {
        let obj = Object::try_from(&credentials).unwrap();
        let values = Object::values(&obj);
        let user = values.get(0);       // username
        let passwd = values.get(1);     // password
        let twofa = values.get(2);      // 2FA
        // Read keyfile if it is given
        if !twofa.is_null() {
            let file = Blob::from(twofa);
            console_log!("FILE {:?}", file);
            let file_reader: FileReaderSync = FileReaderSync::new().unwrap();
            let text = file_reader.read_as_text(&file).unwrap();
            console_log!("Key-File: {}", &text);
        }
        let msg = Array::new_with_length(2);
        msg.set(0, JsValue::from_str("login"));
        msg.set(1, JsValue::from(false));
        post_message(&msg);
    }
}

