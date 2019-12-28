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
use wasm_bindgen::__rt::std::future::Future;
use wasm_bindgen::__rt::std::rc::Rc;
use wasm_bindgen::__rt::core::cell::RefCell;
use wasm_bindgen::__rt::std::sync::Arc;
use web_sys::Window;
use wasm_bindgen::closure::Closure;
use wasm_bindgen::__rt::std::process::Output;

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
    service_status: String,
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
            service_status: String::from("online")

        }
    }

    pub fn set_service_status(&mut self, service_status: String) {
        self.service_status = service_status;
    }

    pub fn check(&self, data: JsValue) -> Promise {
        let replicate = JsFuture::from(PouchDB::replicate(&self.user, &self.group));
        //let replicate = JsFuture::from(self.user.replicate2().to(&self.group));
        let action = JsFuture::from(self.user.find(&data));
        future_to_promise(async move {
            replicate.await;
            let result = action.await;
            let output = result.unwrap().into_serde::<Value>().unwrap();
            log(&format!("{:?}", &output));
            Ok(JsValue::undefined())
        })
    }

    pub fn save(&self, db: String, data: JsValue) -> Promise {
        //log(&format!("Saved: {:?}", &data.into_serde::<Value>().unwrap()));
        let action = match db.as_str() {
            "GroupDB" => {
                JsFuture::from(self.group.post(&data))
            },
            _ => {
                JsFuture::from(self.user.post(&data))
            }
        };
        future_to_promise(async move {
            action.await;
            Ok(JsValue::undefined())
        })
    }

    pub fn find(&self, db: String, data: JsValue) -> Promise {
        //log(&format!("Query: {:?}", &data.into_serde::<Value>().unwrap()));
        let action = match db.as_str() {
            "GroupDB" => {
                JsFuture::from(self.group.find(&data))
            },
            _ => {
                JsFuture::from(self.user.find(&data))
            }
        };
        future_to_promise(async move {
            action.await
        })
    }

    pub fn process(&self, command: String) -> Promise {
        let info = JsFuture::from(self.user.info());
        let adapter = self.user.adapter();

        future_to_promise(async move {
            let output = match command.as_str() {
                "adapter" => adapter,
                "info" => {
                    match info.await {
                        Ok(resolved) => {
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
            Ok(JsValue::from(output))
        })
    }
}







