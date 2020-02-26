use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::{spawn_local, future_to_promise};
use wasm_bindgen_futures::JsFuture;
use wasm_bindgen::__rt::std::future::Future;
use wasm_bindgen::__rt::std::rc::Rc;
use wasm_bindgen::__rt::core::cell::RefCell;
use wasm_bindgen::__rt::std::sync::{Arc, Mutex, PoisonError};
use wasm_bindgen::JsCast;
use wasm_bindgen::__rt::std::collections::HashMap;
use js_sys::{Promise, Array, ArrayBuffer};
use web_sys::{MessageEvent};
use serde_json::{Value};
use serde::{Deserialize, Serialize};
use serde_json::json;
use serde_json::value::Value::Bool;

use crate::log;
use crate::easypass::worker::Worker;

impl Worker {
    pub async fn handle_network_change(self: Rc<Worker>) {
        console_log!("Network change!!!");
    }
}
