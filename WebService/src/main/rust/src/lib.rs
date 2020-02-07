#![feature(in_band_lifetimes)]

mod utils;

use wasm_bindgen::prelude::*;
mod easypass;
use easypass::easypass::*;
use easypass::timeout::*;
use easypass::worker::*;
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
use wasm_bindgen::__rt::std::sync::{Arc, Mutex, PoisonError};
use wasm_bindgen::JsCast;
use serde_json::value::Value::Bool;
use wasm_bindgen::__rt::std::collections::HashMap;

use web_sys::{MessageEvent};

extern crate rand;
use rand::Rng;
use wasm_bindgen::__rt::Ref;
use wasm_bindgen::__rt::core::borrow::{BorrowMut, Borrow};


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

    #[wasm_bindgen(js_name = sleep)]
    fn sleep(timeout: u64);

    #[wasm_bindgen(js_name = addEventListenerWorker)]
    fn add_message_listener(name: &str, closure: &Closure<dyn FnMut(MessageEvent)>);

    #[wasm_bindgen(js_name = removeEventListenerWorker)]
    fn remove_message_listener(name: &str, closure: &Closure<dyn FnMut(MessageEvent)>);
}

#[wasm_bindgen]
pub struct Backend {
    controller: Controller
}

pub struct Controller {
    data: Arc<Mutex<Data>>
}

pub struct Data {
    worker: Worker,
    init_closure: Option<Closure<dyn FnMut(MessageEvent)>>,
    main_closure: Option<Closure<dyn FnMut(MessageEvent)>>
}

#[wasm_bindgen]
impl Backend {

    #[wasm_bindgen(constructor)]
    pub fn new() -> Backend {
        Backend {
            controller: Controller::new()
        }
    }

    pub fn start(&mut self) {
        self.controller.start();
    }
}

impl Controller {
    pub fn new() -> Controller {
        let data = Data {
            worker: Worker::new(String::from("")),
            init_closure: None,
            main_closure: None
        };
        let data = Arc::new(Mutex::new(data));
        Controller {
            data
        }
    }

    pub fn start(&mut self) {

        let this_here = self.data.clone();
        let this_moved = self.data.clone();

        let closure = Closure::new(move |e: MessageEvent| {

            let mut this = this_moved.lock().unwrap();
            log("Received data!");

            log(&format!("WHAT!: {:?}", &e.data()));

            let check: String = e.data().as_string().unwrap();
            log(&format!("Check: {}", &check));

            if check == "initAck" {
                let init_closure = this.init_closure.as_ref().unwrap();
                remove_message_listener(&"message", init_closure);

                this.init_closure = None;

                let closure
                    = Controller::build_main_closure(this_moved.clone());

                add_message_listener(&"message", &closure);
                this.main_closure = Some(closure);

                Worker::all_docs_without_passwords(&this.worker.get_private_local_db())
            }
        });

        add_message_listener(&"message", &closure);

        let mut this = this_here.lock().unwrap();
        this.init_closure = Some(closure);

        post_message(&JsValue::from("initDone"));

    }

    pub fn build_main_closure(data: Arc<Mutex<Data>>) -> Closure<dyn FnMut(MessageEvent)> {
        Closure::new(move |e: MessageEvent| {
            log("2");
            let this = data.lock().unwrap();
            let worker = &this.worker;
            let (cmd, data) = e.data().get_message();
            // TODO update worker to use Value instead of JsValue
            let data = JsValue::from_serde(&data).unwrap();

            log("Received data!");
            log(&format!("CMD: {} | DATA: {:?}", &cmd, &data));
            log(&format!("Hey!: {:?}", &e.data()));
            log(&format!("Hey!: {:?}", &this.worker.get_service_status().lock().unwrap()));
            match cmd.as_ref() {
                /**
                case 'unregister':
                mode = undefined;
                break;
                */
                "savePassword" => {
                    // await worker.save_password(data);
                    worker.save_password(data);
                }
                "updatePassword" => {
                    // await worker.update_password(data);
                    worker.update_password(data);
                }
                "deletePassword" => {
                    // await worker.delete_password(data);
                    worker.delete_password(data);
                }
                "undoDeletePassword" => {
                    // await worker.undo_delete_password(data);
                    worker.undo_delete_password(data);
                }
                "getPassword" | "getPasswordForUpdate" | "getPasswordToClipboard" |
                "getPasswordAndRedirect" => {
                    // const encrypted = (await worker.find({"selector":{"_id": data._id, "_rev": data._rev}})).docs[0];
                    // TODO call decryption
                    // const decrypted = encrypted;
                    // if (cmd === 'getPasswordAndRedirect') {
                    //    self.postMessage([cmd, {_id: decrypted._id, passwd: decrypted.passwd, url: data.url}]);
                    // } else self.postMessage([cmd, {_id: decrypted._id, passwd: decrypted.passwd}]);
                    // TODO This section is needs really, really a refactor
                    //  really
                    log("why?");
                    let why = data.into_serde::<Value>().unwrap();
                    log(&format!("{:?}", &why));
                    let action = JsFuture::from(worker.find(JsValue::from_serde(&json!({
                            "selector": {
                                "_id": why["_id"],
                                "_rev": why["_rev"],
                            }
                        })).unwrap()));
                    future_to_promise(async move {
                        let result_raw = action.await.unwrap();
                        let result_raw = result_raw.into_serde::<Value>().unwrap();
                        let result = &result_raw["docs"][0];
                        let back = if cmd == "getPasswordAndRedirect" {
                            JsValue::from_serde(&json!({
                                "_id": result["_id"],
                                "passwd": result["passwd"],
                                "url": result["url"]
                            })).unwrap()
                        } else {
                            JsValue::from_serde(&json!({
                                "_id": result["_id"],
                                "passwd": result["passwd"]
                            })).unwrap()
                        };
                        log(&format!("{:?}", &back));
                        post_message(&JsValue::from_serde(&json!([
                            cmd, back.into_serde::<Value>().unwrap()
                        ])).unwrap());
                        Ok(JsValue::from(true))
                    });

                }
                "saveCategory" => {
                    //  await worker.save_category(data);
                    worker.save_category(data);
                }
                "updateCategory" => {
                    // await worker.update_category(data);
                    worker.update_category(data);
                }
                "deleteCategories" => {
                    // await worker.delete_categories(data);
                    worker.delete_categories(Array::from(&data));
                }
                "undoDeleteCategories" => {
                    // await worker.undo_delete_categories(data);
                    worker.undo_delete_categories(Array::from(&data));
                }
                _ => {}
            }
        })
    }

}

trait Utils {
    fn get_message(&self) -> (String, Value);
}

impl Utils for JsValue {
    fn get_message(&self) -> (String, Value) {
        let mut raw: Vec<Value> = self.into_serde().unwrap();
        let data = raw.pop().unwrap();
        let cmd = String::from(raw.pop().unwrap().as_str().unwrap());
        (cmd, data)
    }
}









