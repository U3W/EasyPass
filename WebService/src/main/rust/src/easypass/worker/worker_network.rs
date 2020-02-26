use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::{spawn_local, future_to_promise};
use wasm_bindgen_futures::JsFuture;
use wasm_bindgen::__rt::std::future::Future;
use wasm_bindgen::__rt::std::rc::Rc;
use wasm_bindgen::__rt::core::cell::{RefCell, Ref, RefMut};
use wasm_bindgen::__rt::std::sync::{Arc, Mutex, PoisonError};
use wasm_bindgen::JsCast;
use wasm_bindgen::__rt::std::collections::HashMap;
use js_sys::{Promise, Array, ArrayBuffer};
use web_sys::{MessageEvent};
use serde_json::{Value};
use serde::{Deserialize, Serialize};
use serde_json::json;
use serde_json::value::Value::Bool;

use crate::{log, get_database_url};
use crate::easypass::worker::{Worker, ConnectionPlus};

impl Worker {
    pub async fn handle_network_change(self: Rc<Worker>, online: JsValue) {
        let online = online.as_bool().unwrap();
        // Network went from offline to online
        if online {
            // Check credentials
            let check = self.clone().network_login(
                String::from(self.user.borrow().as_ref().unwrap()),
                String::from(self.mkey.borrow().as_ref().unwrap())
            ).await;
            console_log!("Network check {}!", &check);
            if check {
                // Check if remote databases were initialized
                if self.database_url_is_set.borrow().eq(&false) {
                    let result = JsFuture::from(get_database_url()).await;
                    if result.is_ok() {
                        // If remote database is fetched, init remotes
                        let database_url = result.unwrap().as_string().unwrap();
                        // Get needed user hash for database and used closures
                        let user = Ref::map(self.user.borrow(), |t| {
                            t.as_ref().unwrap()
                        });
                        let sync_closure = Ref::map(self.closures.borrow(), |t| {
                            &t.as_ref().unwrap().sync_closure
                        });
                        let sync_error_closure = Ref::map(self.closures.borrow(), |t| {
                            &t.as_ref().unwrap().sync_error_closure
                        });
                        // Initialize remote database of private password entries
                        let mut cell = self.private.borrow_mut();
                        let private = cell.as_mut().unwrap();
                        private.set_remote_db(
                            database_url.clone(), user.clone(),
                            &sync_closure, &sync_error_closure
                        );

                        // TODO initialize remote group databases

                        // End successful initialization with setting database url
                        self.database_url.replace(Some(database_url));
                        self.database_url_is_set.replace(true);
                    } else {
                        // Try to fetch database url again for initialization
                        // TODO implement fetch interval
                    }

                }
            } else {
                // Logout on bad check
                Worker::build_and_post_message("wrongCreds", JsValue::undefined());
            }
        }

    }
}
