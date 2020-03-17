use crate::easypass::worker::Worker;
use crate::{post_message, log};
use crate::easypass::timeout::Timeout;
use crate::easypass::recovery::{RecoverPassword, Category, RecoverCategory};
use crate::easypass::connection::Connection;
use crate::easypass::formats::CRUDType;
use crate::easypass::group_keys::GroupKeys;

extern crate rand;
use rand::Rng;

use wasm_bindgen::__rt::std::rc::Rc;
use wasm_bindgen_futures::JsFuture;
use wasm_bindgen_futures::future_to_promise;
use wasm_bindgen::JsValue;
use js_sys::{Promise, Array, ArrayBuffer};
use serde_json::Value;



impl Worker {

    pub async fn add_group(self: Rc<Worker>, data: JsValue) {
        console_log!("Add group!");
        console_log!("DaTa: {:?}", &data);

        let group = JsValue::into_serde::<Value>(&data).unwrap();

        // TODO @Martin Add Group API
        let (gid, gmk, amk)
            = (String::from(group["name"].as_str().unwrap()),
               String::from("tollerkey"),
               String::from("adminkey"));

        self.save_group(gid, gmk, amk).await;
    }

    pub fn setup_new_group(
        self: Rc<Worker>, id: String, gid: String, gmk: String, amk: Option<String>
    ) {
        let connection = Connection::build_connection(
            self.clone(), CRUDType::Group, Some(gid),
            self.get_user(), self.get_database_url());
        self.groups.borrow_mut().insert(id.clone(), connection);

        // TODO @moritz decrypt gmk and amk with user mkey

        let group_keys = GroupKeys::new(gmk, amk);
        self.group_keys.borrow_mut().insert(id, group_keys);
    }
}