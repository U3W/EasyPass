use crate::easypass::worker::Worker;
use wasm_bindgen::prelude::*;
use wasm_bindgen::__rt::std::rc::Rc;
use js_sys::Array;
use crate::post_message;

impl Worker {
    pub async fn login(self: Rc<Worker>) {
        let msg = Array::new_with_length(2);
        msg.set(0, JsValue::from_str("login"));
        msg.set(1, JsValue::from(true));
        post_message(&msg);
    }
}