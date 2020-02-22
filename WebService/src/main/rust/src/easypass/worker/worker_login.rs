use wasm_bindgen::prelude::*;
use wasm_bindgen::__rt::std::rc::Rc;
use js_sys::{Array, Object};
use web_sys::{FileReaderSync, Blob, File};
use serde_json::Value;
use crate::easypass::worker::Worker;
use crate::{post_message, log};

impl Worker {
    pub async fn login(self: Rc<Worker>, credentials: JsValue) {
        // Get credential values
        let obj = Object::try_from(&credentials).unwrap();
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
        // Check credentials
        let check = if user == "test" && mkey == "test" {
            // Successful check
            // TODO @Moritz build userhash
            let user_hash = user;
            // Attach credentials to worker
            self.user.replace(Some(user_hash));
            self.mkey.replace(Some(mkey));
            // Init databases in worker
            self.clone().init().await;
            true
        } else {
            // Unsuccessful check
            false
        };
        let msg = Array::new_with_length(2);
        msg.set(0, JsValue::from_str("login"));
        msg.set(1, JsValue::from(check));
        post_message(&msg);
    }
}

