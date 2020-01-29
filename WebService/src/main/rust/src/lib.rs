#![feature(in_band_lifetimes)]

mod utils;

use wasm_bindgen::prelude::*;
mod pouchdb;
use pouchdb::pouchdb::*;
use wasm_bindgen_futures::{spawn_local, future_to_promise};
use wasm_bindgen_futures::JsFuture;

use serde_json::{Value};
use js_sys::{Promise, Array, ArrayBuffer};
use serde::{Deserialize, Serialize};
use serde_json::json;
use wasm_bindgen::__rt::std::future::Future;
use wasm_bindgen::__rt::std::rc::Rc;
use wasm_bindgen::__rt::core::cell::RefCell;
use wasm_bindgen::__rt::std::sync::Arc;
use wasm_bindgen::JsCast;


#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;




#[wasm_bindgen]
extern {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    #[wasm_bindgen(js_name = postMessage)]
    fn post_message(message: &JsValue);

    #[wasm_bindgen(js_name = postMessage)]
    fn post_message_with_transfer(message: &JsValue, transfer: &JsValue);
}

#[wasm_bindgen]
pub struct Worker {
    local: PouchDB,
    remote: PouchDB,
    service_status: String,
    closure: Closure<FnMut()>
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
            service_status: String::from("online"),
            closure: Closure::new(|| log("hello"))
        }
    }

    pub fn kek(&self) -> SyncHandler {
        //hello();
        log(&"KEEEEEEEEEEEEEEEEEEEEEEEEKKK!!!!!!!");
        let wut: SyncHandler = self.local.sync_2(&self.remote,
        JsValue::from_serde(&json!({
            "live": true,
            "retry": true
        })).unwrap());

        /**
        wut.on("change", &|| {
            log("Hey, something changed!!!");
        });
        wut.on("complete", &|| {
            log("Hey, something completed!!!");
        });
        */

        /**
        let cb = Closure::wrap(Box::new(|| {
            log("Wuhuu!");
        }) as Box<dyn FnMut()>);

        wut.on(&"change", &cb.as_ref().unchecked_ref());
        wut.on(&"complete", &cb.as_ref().unchecked_ref());*/

        wut.on("change", &self.closure);
        wut.on("complete", &self.closure);

        wut
    }

    pub fn set_remote(&mut self, url: String) {
        self.remote = PouchDB::new_with_name(&url);
    }

    pub fn set_service_status(&mut self, service_status: String) {
        self.service_status = service_status;
    }

    // Error is thrown when remote is not established
    // TODO rewrite check
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
                let msg = Array::new_with_length(2);
                msg.set(0, JsValue::from_str(&"kek"));
                msg.set(1, JsValue::from_str(&"kek"));
                // TODO use this to send results
                //post_message(&JsValue::from(msg));
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

    pub fn remove_with_element(&self, data: JsValue) -> Promise {
        let action = JsFuture::from(self.local.remove_with_element(&data));
        future_to_promise(async move {
            action.await
        })
    }

    pub fn remove(&self, doc_id: JsValue, doc_rev: JsValue) -> Promise {
        let action = JsFuture::from(self.local.remove(&doc_id, &doc_rev));
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


#[wasm_bindgen]
extern "C" {
    fn setInterval(closure: &Closure<FnMut()>, millis: u32) -> f64;
    fn cancelInterval(token: f64);
}

#[wasm_bindgen]
pub struct Interval {
    closure: Closure<FnMut()>,
    token: f64,
}

impl Interval {
    pub fn new<F: 'static>(millis: u32, f: F) -> Interval
        where
            F: FnMut()
    {
        // Construct a new closure.
        let closure = Closure::new(f);

        // Pass the closuer to JS, to run every n milliseconds.
        let token = setInterval(&closure, millis);

        Interval { closure, token }
    }
}

// When the Interval is destroyed, cancel its `setInterval` timer.
impl Drop for Interval {
    fn drop(&mut self) {
        cancelInterval(self.token);
    }
}

// Keep logging "hello" every second until the resulting `Interval` is dropped.
#[wasm_bindgen]
pub fn hello() -> Interval {
    Interval::new(1_000, || log("hello"))
}







