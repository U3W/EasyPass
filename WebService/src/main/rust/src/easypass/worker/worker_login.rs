use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use wasm_bindgen::__rt::std::rc::Rc;
use js_sys::{Array, Object};
use web_sys::{FileReaderSync, Blob, File};
use serde_json::Value;
use serde_json::json;
use crate::easypass::worker::Worker;
use crate::{post_message, log, is_online};
use crate::pouchdb::pouchdb::{PouchDB, Settings};


impl Worker {
    /// Checks the user credentials for authentication in the app.
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
        // Check credentials depending on network status
        let check = if is_online() {
            self.clone().login_online(user, mkey).await
        } else {
            self.clone().login_offline(user, mkey).await
        };
        // Send response to UI thread
        Worker::build_and_post_message(&"login", JsValue::from(check));
    }

    /// This authentication method is used when the client is online.
    /// The credentials are checked with the Easypass-Service.
    async fn login_online(self: Rc<Worker>, user: String, mkey: String) -> bool {
        // TODO @Martin Define Login API...
        //  Remove this dummy implementation later on
        let check = if user == "test" && mkey == "test" {
            // Successful check
            // TODO @Moritz build userhash
            let user_hash = user;
            // Attach credentials to worker
            self.user.replace(Some(user_hash));
            self.mkey.replace(Some(mkey));
            // Init databases in worker
            self.clone().set_database_url().await;
            true
        } else {
            // Unsuccessful check
            false
        };
        check
    }

    /// This authentication method is used when the client is offline.
    /// The credentials are checked through hashes in the local database.
    async fn login_offline(self: Rc<Worker>, user: String, mkey: String) -> bool {
        // TODO @Moritz build userhash
        let user_hash = user;
        // Setup meta-database
        let settings = Settings { adapter: "idb".to_string() };
        let db_name = format!("{}-meta", &user_hash);
        let meta_db = PouchDB::new(&db_name, &JsValue::from_serde(&settings).unwrap());
        // Perform check
        let check = Worker::check_credentials(&meta_db, &user_hash, &mkey).await;
        if check {
            // Attach credentials to worker
            self.user.replace(Some(user_hash));
            self.mkey.replace(Some(mkey));
            // Init databases in worker
            self.clone().set_database_url().await;
        }
        check
    }

    /// Performs the credential check between the given user input and stored local data.
    async fn check_credentials(meta_db: &PouchDB, user_hash: &str, mkey: &str) -> bool {
        // Query meta-data
        let result_raw = JsFuture::from(meta_db.find(&JsValue::from_serde(&json!({
            "selector": {
                "$or": [
                    {"type": "user"},
                    {"type": "mkey"}
                ]
            }
        })).unwrap())).await.unwrap();
        // Parse received entry
        let result_raw = result_raw.into_serde::<Value>().unwrap();
        let result_1 = &result_raw["docs"][0];
        let result_2 = &result_raw["docs"][1];
        if result_1.is_object() && result_2.is_object() {
            // Meta-data was found in the database
            // Assign it correctly
            let mut user_val = &Value::Null;
            let mut mkey_val = &Value::Null;
            if result_1["mkey"].is_string() {
                // result_1 is mkey, result_2 is user
                mkey_val = result_1;
                user_val = result_2;
            } else {
                mkey_val = result_2;
                user_val = result_1;
            }
            // Check credentials
            if user_val["user"].as_str().unwrap() == user_hash &&
                mkey_val["mkey"].as_str().unwrap() == mkey {
                true
            } else {
                false
            }
        } else {
            // Full meta-data not found in the database
            // Check cannot be done
            false
        }
    }
}

