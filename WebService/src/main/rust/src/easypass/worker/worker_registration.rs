use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::{spawn_local, future_to_promise};
use wasm_bindgen_futures::JsFuture;
use wasm_bindgen::__rt::std::future::Future;
use wasm_bindgen::__rt::std::rc::Rc;
use wasm_bindgen::__rt::core::cell::RefCell;
use wasm_bindgen::__rt::std::sync::{Arc, Mutex, PoisonError};
use wasm_bindgen::JsCast;
use wasm_bindgen::__rt::std::collections::HashMap;
use js_sys::{Promise, Array, ArrayBuffer};
use web_sys::{MessageEvent};
use serde_json::{Value};
use serde::{Deserialize, Serialize};
use serde_json::json;
use serde_json::value::Value::Bool;

use crate::log;
use crate::easypass::worker::Worker;

impl Worker {
    /// Used to register a new user.
    pub async fn registration(self: Rc<Worker>, credentials: JsValue) {
        // TODO registarion process - only works online

        // Get credential values
        /**let obj = Object::try_from(&credentials).unwrap();
        let values = Object::values(&obj);
        // username
        let user = values.get(0).as_string().unwrap();
        // password
        let passwd = values.get(1).as_string().unwrap();
        // 2FA
        let twofa = values.get(2);
        // Read keyfile if it is given
        if !twofa.is_null() {
            let file = Blob::from(twofa);
            console_log!("FILE {:?}", file);
            let file_reader: FileReaderSync = FileReaderSync::new().unwrap();
            let text = file_reader.read_as_text(&file).unwrap();
            console_log!("Key-File: {}", &text);
        }
        // TODO @Moritz build masterkey from password + 2FA
        let mkey = passwd;
        // TODO Remove this dummy code
        // Check credentials depending on network status
        let check = if is_online() {
            self.clone().login_online(user, mkey).await
        } else {
            self.clone().login_offline(user, mkey).await
        };
        // Send response to UI thread*/
        //Worker::build_and_post_message(&"login", JsValue::from(check));
        console_log!("Implement registration");
    }
}