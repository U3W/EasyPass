use crate::easypass::worker::Worker;
use crate::pouchdb::pouchdb::PouchDB;
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
use wasm_bindgen::__rt::core::cell::Ref;


impl Worker {

    /// Saves a group to the meta database to access it-
    /// The connection will be established on the change-event.
    /// [gid] - Group ID
    /// [gmk] - General Master Key
    /// [amk] - Admin Master Key
    // TODO @Kacper remove this when connected to server, server will do this
    pub async fn save_group(self: Rc<Worker>, gid: String, gmk: String, amk: String) {
        let group_data = JsValue::from_serde(&json!({
                "type": "group", "gid": String::from(gid),
                "gmk": String::from(gmk), "amk": String::from(amk)
            })).unwrap();
        let meta_db = self.get_meta_local_db();
        let _ = JsFuture::from(meta_db.post(&group_data)).await;
    }


    pub async fn get_groups(self: Rc<Worker>) -> Vec<Value> {
        let meta_db = &self.get_meta_local_db();
        let data = JsFuture::from(meta_db.find(
            &JsValue::from_serde(&json!({
                "selector": {
                    "type": {"$eq": "group"}
                },
                "fields": [
                    "_id", "_rev", "type", "user", "url", "title", "tags", "tabID", "catID",
                    "name", "desc", "amk", "gmk", "gid"
                ],
        })).unwrap())).await.unwrap();

        let data = data.into_serde::<Value>().unwrap();

        let result = if !data["docs"].is_null() {
            let groups = data["docs"].as_array().unwrap();
            groups.to_vec()
        } else {
            vec![]
        };

        result
    }



    /// Writes and updates metadata.
    /// Meta-data consist of the hash of the username and the encrypted masterkey.
    pub async fn write_meta_data(meta_db: &PouchDB, user: String, mkey: String) {
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
        console_log!("META1!: {:?}", &result_1);
        console_log!("META2!: {:?}", &result_2);

        if result_1.is_null() && result_2.is_null() {
            // No meta-data saved
            let meta_data = JsValue::from_serde(&json!([
                {"type": "mkey", "mkey": String::from(mkey)},
                {"type": "user", "user": String::from(user)}
            ])).unwrap();
            JsFuture::from(meta_db.bulk_docs(&meta_data)).await.unwrap();
        } else if result_1.is_object() && result_2.is_object() {
            // Both meta-data is saved
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
            // Check if meta-data changed
            if mkey_val["mkey"].as_str().unwrap() != &mkey || user_val["user"].as_str().unwrap() != &user {
                let meta_data =
                    if mkey_val["mkey"].as_str().unwrap() != &mkey && user_val["user"].as_str().unwrap() != &user {
                        // Meta-data must be updated
                        JsValue::from_serde(&json!([
                        {"type": "mkey", "mkey": String::from(mkey),
                        "_id": mkey_val["_id"], "_rev": mkey_val["_rev"]},
                        {"type": "user", "user": String::from(user),
                        "_id": user_val["_id"], "_rev": user_val["_rev"]}
                    ])).unwrap()
                    } else if mkey_val["mkey"].as_str().unwrap() == &mkey && user_val["user"].as_str().unwrap() != &user {
                        // User meta-data must be updated
                        JsValue::from_serde(&json!([
                        {"type": "user", "user": String::from(user),
                        "_id": user_val["_id"], "_rev": user_val["_rev"]}
                    ])).unwrap()
                    } else {
                        // Mkey meta-data must be updated
                        JsValue::from_serde(&json!([
                        {"type": "mkey", "mkey": String::from(mkey),
                        "_id": mkey_val["_id"], "_rev": mkey_val["_rev"]},
                    ])).unwrap()
                    };
                JsFuture::from(meta_db.bulk_docs(&meta_data)).await.unwrap();
            }
        } else if result_1.is_object() && result_2.is_null() {
            // One field is missing
            let meta_data = if result_1["mkey"].is_string() {
                // result_1 is mkey, user meta-data is missing
                let meta_data = if result_1["mkey"].as_str().unwrap() == &mkey {
                    // mkey does not need to be updated
                    JsValue::from_serde(&json!([
                        {"type": "user", "user": String::from(user)}
                    ])).unwrap()
                } else {
                    // mkey needs update
                    JsValue::from_serde(&json!([
                        {"type": "mkey", "mkey": String::from(mkey),
                        "_id": result_1["_id"], "_rev": result_1["_rev"]},
                        {"type": "user", "user": String::from(user)}
                    ])).unwrap()
                };
                meta_data
            } else {
                // result_1 is user, mkey meta-data is missing
                let meta_data = if result_1["user"].as_str().unwrap() == &user {
                    // user does not need to be updated
                    JsValue::from_serde(&json!([
                        {"type": "mkey", "mkey": String::from(mkey)},
                    ])).unwrap()
                } else {
                    // user needs update
                    JsValue::from_serde(&json!([
                        {"type": "mkey", "mkey": String::from(mkey)},
                        {"type": "user", "user": String::from(user),
                        "_id": result_1["_id"], "_rev": result_1["_rev"]}
                    ])).unwrap()
                };
                meta_data
            };
            JsFuture::from(meta_db.bulk_docs(&meta_data)).await.unwrap();
        } else {
            // Other filed is missing
            let meta_data = if result_2["mkey"].is_string() {
                // result_2 is mkey, user meta-data is missing
                let meta_data = if result_2["mkey"].as_str().unwrap() == &mkey {
                    // mkey does not need to be updated
                    JsValue::from_serde(&json!([
                        {"type": "user", "user": String::from(user)}
                    ])).unwrap()
                } else {
                    // mkey needs update
                    JsValue::from_serde(&json!([
                        {"type": "mkey", "mkey": String::from(mkey),
                        "_id": result_2["_id"], "_rev": result_2["_rev"]},
                        {"type": "user", "user": String::from(user)}
                    ])).unwrap()
                };
                meta_data
            } else {
                // result_2 is user, mkey meta-data is missing
                let meta_data = if result_2["user"].as_str().unwrap() == &user {
                    // user does not need to be updated
                    JsValue::from_serde(&json!([
                        {"type": "mkey", "mkey": String::from(mkey)},
                    ])).unwrap()
                } else {
                    // user needs update
                    JsValue::from_serde(&json!([
                        {"type": "mkey", "mkey": String::from(mkey)},
                        {"type": "user", "user": String::from(user),
                        "_id": result_2["_id"], "_rev": result_2["_rev"]}
                    ])).unwrap()
                };
                meta_data
            };
            JsFuture::from(meta_db.bulk_docs(&meta_data)).await.unwrap();
        };
    }
}