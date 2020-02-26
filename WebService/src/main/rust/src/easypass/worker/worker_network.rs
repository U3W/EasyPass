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
        console_log!("Network change {}!", &online);
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
                    console_log!("INIT REMOTES!!!");
                    let result = JsFuture::from(get_database_url()).await;
                    if result.is_ok() {
                        let database_url = result.unwrap().as_string().unwrap();

                        let user = Ref::map(self.user.borrow(), |t| {
                            t.as_ref().unwrap()
                        });

                        let sync_closure = Ref::map(self.closures.borrow(), |t| {
                            &t.as_ref().unwrap().sync_closure
                        });
                        let sync_error_closure = Ref::map(self.closures.borrow(), |t| {
                            &t.as_ref().unwrap().sync_error_closure
                        });

                        //let mut private = RefMut::map(self.private.borrow_mut(), |t| {
                        //    &mut t.as_deref_mut().as_ref().unwrap()
                        //});

                        {
                            //let mut test = self.private.borrow_mut();
                            //let mut keke = test.as_ref().unwrap();

                            //let mut private = RefMut::map(self.private.borrow_mut(), |t| {
                            //    &mut t.as_mut().unwrap()
                            //});
                            let mut cell = self.private.borrow_mut();
                            let private = cell.as_mut().unwrap();

                            private.set_remote_db(
                                database_url.clone(), user.clone(),
                                &sync_closure, &sync_error_closure
                            );
                        }
                        /**if let Some(private) = &mut self.private.borrow_mut() {
                            *private.set_remote_db(
                                database_url.clone(), user.clone(),
                                &sync_closure, &sync_error_closure
                            );
                        }*/

                        self.database_url.replace(Some(database_url));
                        self.database_url_is_set.replace(true);
                    } else {

                    }

                }
            } else {
                // Logout on bad check
                Worker::build_and_post_message("wrongCreds", JsValue::undefined());
            }
        }

    }
}
