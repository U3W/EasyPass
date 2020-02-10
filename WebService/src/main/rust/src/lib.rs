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
use wasm_bindgen::__rt::std::sync::{Arc, Mutex, PoisonError, MutexGuard};
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

/// Represents the Backend - logic functionalities - of the Web-App.
#[wasm_bindgen]
pub struct Backend {
    state: Arc<Mutex<State>>
}

/// Stores the internal state of the Backend of the Web-App.
pub struct State {
    mode: Option<String>,
    worker: Worker,
    init_closure: Option<Closure<dyn FnMut(MessageEvent)>>,
    main_closure: Option<Closure<dyn FnMut(MessageEvent)>>
}

#[wasm_bindgen]
impl Backend {

    /// Creates a new Backend.
    #[wasm_bindgen(constructor)]
    pub fn new() -> Backend {
        // Setup panic hook for better warnings
        utils::set_panic_hook();
        // Build and setup internal state
        let state = State {
            mode: None,
            worker: Worker::new(String::from("")),
            init_closure: None,
            main_closure: None
        };
        // Arc and Mutex are needed to modify internal states safely
        // when it is used in many different parts of the application
        let state = Arc::new(Mutex::new(state));
        Backend {
            state
        }
    }

    /// Starts the whole Backend.
    /// Creates message listeners for UI requests.
    /// Also database are initialized and managed.
    pub fn start(&mut self) {
        // Clone and bind internal states
        let state_here = self.state.clone();
        let state_moved = self.state.clone();
        // Create closure for startup process
        let closure = Closure::new(move |e: MessageEvent| {
            // Lock and get internal state
            let mut state = state_moved.lock().unwrap();
            // Parse UI request
            let check: String = e.data().as_string().unwrap();
            // Check if UI is ready for further action
            if check == "initAck" {
                // If so, remove closure for startup process as listener
                let init_closure = state.init_closure.as_ref().unwrap();
                remove_message_listener(&"message", init_closure);
                state.init_closure = None;
                // Create new closure for main process
                let closure
                    = Backend::build_main_closure(state_moved.clone());
                // Bind closure for main process to message listener
                add_message_listener(&"message", &closure);
                // Save closure in state
                state.main_closure = Some(closure);
            }
        });
        // Bind closure for startup process to message listener
        add_message_listener(&"message", &closure);
        // Save closure in state
        let mut state = state_here.lock().unwrap();
        state.init_closure = Some(closure);
        // Tell UI initialization is done
        post_message(&JsValue::from("initDone"));
    }

    /// Returns "main" closure that process UI requests.
    fn build_main_closure(state: Arc<Mutex<State>>) -> Closure<dyn FnMut(MessageEvent)> {
        Closure::new(move |e: MessageEvent| {
            // Lock and get internal state
            let mut state
                = state.lock().unwrap_or_else(PoisonError::into_inner);
            // Get command and additional data of UI request
            let (cmd, data) = e.data().get_message();

            // TODO remove this logs
            log("Received data!");
            log(&format!("CMD: {} | DATA: {:?}", &cmd, &data));
            log(&format!("Hey!: {:?}", &e.data()));

            // Check which mode (= active page in UI) is and perform
            // associated function
            // If no mode is set, set it
            if state.mode.as_ref().is_none() {
                state.mode = Some(String::from(&cmd));
                // If the dashboard page is called
                if state.mode.as_ref().unwrap().as_str() == "dashboard" {
                    // Send all entries to UI
                    Worker::all_docs_without_passwords(&state.worker.get_private_local_db())
                }
            } else {
                match state.mode.as_ref().unwrap().as_str() {
                    "dashboard" => Backend::dashboard_call(cmd, data, state),
                    _ => {}
                }
            }

        })
    }

    /// Process calls on the dashboard page.
    fn dashboard_call(cmd: String, data: JsValue, mut state: MutexGuard<State>) {
        log("DASHBOARD_CALL");
        // Bind worker to local variable
        let worker = &state.worker;
        // Perform operation
        match cmd.as_ref() {
            "savePassword" => {
                worker.save_password(data);
            }
            "updatePassword" => {
                worker.update_password(data);
            }
            "deletePassword" => {
                worker.delete_password(data);
            }
            "undoDeletePassword" => {
                worker.undo_delete_password(data);
            }
            "getPassword" | "getPasswordForUpdate" |
            "getPasswordToClipboard" | "getPasswordAndRedirect" => {
                worker.get_password(cmd, data);
            }
            "saveCategory" => {
                worker.save_category(data);
            }
            "updateCategory" => {
                worker.update_category(data);
            }
            "deleteCategories" => {
                worker.delete_categories(data);
            }
            "undoDeleteCategories" => {
                worker.undo_delete_categories(data);
            }
            "unregister" => {
                state.mode = None;
            }
            _ => {}
        }
    }
}

trait Utils {
    /// Used to parse UI requests.
    /// Returns command as an String, data is left untouched as JsValue
    fn get_message(&self) -> (String, JsValue);
}

impl Utils for JsValue {
    /// Used to parse UI requests.
    /// Returns command as an String, data is left untouched as JsValue
    fn get_message(&self) -> (String, JsValue) {
        let array = Array::from(self);
        let cmd = array.get(0).as_string().unwrap();
        let data = array.get(1);
        //let data_parsed = data.clone().into_serde::<Value>().unwrap();
        (cmd, data)
    }
}









