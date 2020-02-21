use wasm_bindgen::prelude::*;
use wasm_bindgen::__rt::std::rc::Rc;
use js_sys::Array;
use crate::easypass::worker::Worker;
use crate::{post_message, log};

impl Worker {
    pub async fn login(self: Rc<Worker>) {
        console_log!("WUT {}", &self.service_status.borrow());
        console_log!("Walter!!!");
        let msg = Array::new_with_length(2);
        msg.set(0, JsValue::from_str("login"));
        msg.set(1, JsValue::from(true));
        post_message(&msg);
    }
}