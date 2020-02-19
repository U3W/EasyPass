use crate::easypass::worker::Worker;
use wasm_bindgen::prelude::*;
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
use crate::log;

pub struct WorkerEvents {}

impl WorkerEvents {
    pub fn network(worker: Rc<Worker>) -> Closure<dyn FnMut()> {
        log("network moi");
        Closure::new(move || {
            log("kek!");
            let worker = worker.clone();
            spawn_local(async move {
                log("network moi");
            });
        })
    }
}
