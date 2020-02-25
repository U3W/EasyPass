#![feature(in_band_lifetimes)]
mod crypto;
mod utils;

use wasm_bindgen::prelude::*;
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
    local: PouchDB,
    remote: PouchDB,
    service_status: String,
}

#[wasm_bindgen]
impl Worker {
    #[wasm_bindgen(constructor)]
    pub fn new(url: String) -> Worker {
        utils::set_panic_hook();
        let settings = Settings { adapter: "idb".to_string() };
        log(&format!("Length: {}", url.len()));
        let remote = if url.len() == 0 {
            let temporary = Temporary { adapter: "idb".to_string(), skip_setup: true };
            PouchDB::new("Temporary", &JsValue::from_serde(&temporary).unwrap())
        } else {
            PouchDB::new_with_name(&url)
        };
        Worker {
            local: PouchDB::new("Local", &JsValue::from_serde(&settings).unwrap()),
            remote,
            service_status: String::from("online")
        }
    }

    pub fn set_remote(&mut self, url: String) {
        self.remote = PouchDB::new_with_name(&url);
    }

    pub fn set_service_status(&mut self, service_status: String) {
        self.service_status = service_status;
    }

    // Error is thrown when remote is not established
    pub fn check(&self) -> Promise {
        let status = self.service_status.clone();
        let local: PouchDB = self.local.clone();
        let replicate = if status == "online" {
            JsFuture::from(local.sync(&self.remote))
        } else {
            //JsFuture::from(PouchDB::replicate(&self.local, &self.remote))
            JsFuture::from(Promise::resolve(&JsValue::undefined()))
        };
        future_to_promise(async move {
            return if status == "online" {
                //log(&format!("{:?}", &JsFuture::from(local.info()).await.unwrap().into_serde::<Info>().unwrap()));
                //log(&format!("{:?}", &JsFuture::from(local.get_conflicts("4889f782-f945-427a-99f7-1e4b8d32c868")).await.unwrap().into_serde::<Value>().unwrap()));
                replicate.await
            } else {
                replicate.await
            }
        })
    }

    pub fn save(&self, data: JsValue) -> Promise {
        //log(&format!("Saved: {:?}", &data.into_serde::<Value>().unwrap()));
        let action = JsFuture::from(self.local.post(&data));
        future_to_promise(async move {
            action.await
        })
    }

    pub fn update(&self, data: JsValue) -> Promise {
        let action = JsFuture::from(self.local.put(&data));
        future_to_promise(async move {
            action.await
        })
    }

    pub fn find(&self, data: JsValue) -> Promise {
        let action = JsFuture::from(self.local.find(&data));
        future_to_promise(async move {
            action.await
        })
    }

    pub fn all_docs(&self) -> Promise {
        let action = JsFuture::from(self.local.all_docs_included());
        future_to_promise(async move {
            action.await
        })
    }

    pub fn remove(&self, data: JsValue) -> Promise {
        let action = JsFuture::from(self.local.remove(&data));
        future_to_promise(async move {
            action.await
        })
    }

    pub fn process(&self, command: String) -> Promise {
        let info = JsFuture::from(self.local.info());
        let adapter = self.local.adapter();

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







