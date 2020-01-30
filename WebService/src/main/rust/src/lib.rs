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
use wasm_bindgen::__rt::std::sync::{Arc, Mutex};
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
    private: Connection,
    service_status: Arc<Mutex<String>>
}

pub struct Connection {
    local: Arc<Mutex<PouchDB>>,
    remote: Option<PouchDB>,
    sync: Option<Sync>
}

pub struct Sync {
    sync_handler: SyncHandler,
    change: Closure<dyn FnMut(JsValue)>,
    error: Closure<dyn FnMut(JsValue)>
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
            Some(PouchDB::new("Temporary", &JsValue::from_serde(&temporary).unwrap()))
        } else {
            Some(PouchDB::new_with_name(&url))
        };
        let private = Connection {
            local: Arc::new(Mutex::new(PouchDB::new("Local", &JsValue::from_serde(&settings).unwrap()))),
            remote,
            sync: None
        };
        Worker {
            private,
            service_status: Arc::new(Mutex::new(String::from("online"))),
        }
    }

    pub fn heartbeat(&mut self) {
        let sync_handler: SyncHandler
            = self.private.local.lock().unwrap().sync(&self.private.remote.as_ref().unwrap());

        let service_status = Arc::clone(&self.service_status);
        let private_db = Arc::clone(&self.private.local);
        let change_closure = Closure::new(move |val: JsValue| {
            log(&format!("Change {:?}", &val));
            log(&format!("Change!! {}", &service_status.lock().unwrap()));
            /**let action
                = JsFuture::from(private_db.lock().unwrap().all_docs_without_passwords());
            future_to_promise(async move {
                let result = action.await;
                let msg = Array::new_with_length(2);
                msg.set(0, JsValue::from_str("allEntries"));
                // TODO error handling
                msg.set(1, result.unwrap());
                post_message(&msg);
                Ok(JsValue::undefined())
            });*/
            Worker::all_docs_without_passwords(&private_db.lock().unwrap());
        });

        let service_status = Arc::clone(&self.service_status);
        let error_closure = Closure::new(move |val: JsValue| {
            log(&format!("Error {:?}", &val));
            log(&format!("Error!! {}", &service_status.lock().unwrap()));
        });

        sync_handler.on_change(&change_closure);
        sync_handler.on_error(&error_closure);

        let sync = Sync {
            sync_handler,
            change: change_closure,
            error: error_closure
        };

        self.private.sync = Some(sync);

        Worker::all_docs_without_passwords(&self.private.local.lock().unwrap());
    }

    fn all_docs_without_passwords(db: &PouchDB) -> Promise {
        let action = JsFuture::from(db.all_docs_without_passwords());
        future_to_promise(async move {
            let result = action.await;
            let msg = Array::new_with_length(2);
            msg.set(0, JsValue::from_str("allEntries"));
            // TODO error handling
            msg.set(1, result.unwrap());
            post_message(&msg);
            Ok(JsValue::undefined())
        })
    }

    pub fn save(&self, data: JsValue) -> Promise {
        let db = self.private.local.lock().unwrap();
        let action = JsFuture::from(db.post(&data));
        future_to_promise(async move {
            action.await
        })
    }

    pub fn update(&self, data: JsValue) -> Promise {
        let db = self.private.local.lock().unwrap();
        let action = JsFuture::from(db.put(&data));
        future_to_promise(async move {
            action.await
        })
    }

    pub fn find(&self, data: JsValue) -> Promise {
        let db = self.private.local.lock().unwrap();
        let action = JsFuture::from(db.find(&data));
        future_to_promise(async move {
            action.await
        })
    }

    pub fn all_docs(&self) -> Promise {
        let db = self.private.local.lock().unwrap();
        let action = JsFuture::from(db.all_docs_included());
        future_to_promise(async move {
            action.await
        })
    }

    pub fn remove_with_element(&self, data: JsValue) -> Promise {
        let db = self.private.local.lock().unwrap();
        let action = JsFuture::from(db.remove_with_element(&data));
        future_to_promise(async move {
            action.await
        })
    }

    pub fn remove(&self, doc_id: JsValue, doc_rev: JsValue) -> Promise {
        let db = self.private.local.lock().unwrap();
        let action = JsFuture::from(db.remove(&doc_id, &doc_rev));
        future_to_promise(async move {
            action.await
        })
    }
}







