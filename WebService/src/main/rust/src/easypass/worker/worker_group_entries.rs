use crate::easypass::worker::Worker;
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
use crate::easypass::worker::worker_crud::CRUDType;


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
}