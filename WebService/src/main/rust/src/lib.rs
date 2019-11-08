#![feature(in_band_lifetimes)]

mod utils;

use wasm_bindgen::prelude::*;
mod crypto;
use crypto::crypto as Crypto;
mod pouchdb;
use pouchdb::pouchdb::*;
use wasm_bindgen_futures::{spawn_local, future_to_promise};
use wasm_bindgen_futures::JsFuture;

use serde_json::{Value};
use js_sys::{Promise};
use serde::{Deserialize, Serialize};

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub struct Worker {
    user: PouchDB,
    group: PouchDB,
    output: String
}

#[wasm_bindgen]
impl Worker {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Worker {
        utils::set_panic_hook();
        let settings = Settings { adapter: "idb".to_string() };
        Worker {
            user: PouchDB::new("UserDB", &JsValue::from_serde(&settings).unwrap()),
            group: PouchDB::new("GroupDB", &JsValue::from_serde(&settings).unwrap()),
            output: String::new() }

    }

    pub fn get_output(&self) -> String {
        String::from(self.output.as_str())
    }
}

#[wasm_bindgen]
pub async fn save(worker: Worker, db: String, data: JsValue) -> Worker {
    log(&format!("Saved: {:?}", &data.into_serde::<Value>().unwrap()));
    match db.as_str() {
        "GroupDB" => {
            let _ = JsFuture::from(worker.group.post(&data)).await;
        },
        _ => {
            let _ = JsFuture::from(worker.user.post(&data)).await;
        }
    }
    worker
}

#[wasm_bindgen]
pub async fn process(mut worker: Worker, command: String) -> Worker {
    let output = match command.as_str() {
        "adapter" => { worker.user.adapter() }
        "info" => {
            match JsFuture::from(worker.user.info()).await {
                // Check if syntax is resolved
                Ok(resolved) => {
                    // Check if serialization worked
                    // Does not work on remote databases yet
                    // Reason: Info-struct is
                    match resolved.into_serde::<Info>() {
                        Ok(val) => format!("{:?}", &val),
                        Err(_) => "Deserialize error".to_string(),
                    }
                },
                Err(_) => "Promise error".to_string(),
            }
        }
        _ => String::from("Unknown command")
    };
    worker.output = output;
    worker
}







