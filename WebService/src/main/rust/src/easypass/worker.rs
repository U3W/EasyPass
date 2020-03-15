
use crate::easypass::timeout::*;
use crate::pouchdb::pouchdb::*;
use crate::{is_online, get_node_mode, get_database_url, post_message, log};
use crate::easypass::recovery::{RecoverCategory, RecoverPassword};

extern crate rand;
use rand::Rng;

use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::{spawn_local, future_to_promise};
use wasm_bindgen_futures::JsFuture;
use wasm_bindgen::__rt::std::future::Future;
use wasm_bindgen::__rt::std::rc::Rc;
use wasm_bindgen::__rt::core::cell::{RefCell, Ref};
use wasm_bindgen::__rt::std::sync::{Arc, Mutex, PoisonError};
use wasm_bindgen::__rt::std::collections::HashMap;
use js_sys::{Promise, Array, ArrayBuffer};
use web_sys::{MessageEvent};
use serde::{Deserialize, Serialize};
use serde_json::json;
use serde_json::{Value};
use serde_json::value::Value::Bool;
use wasm_bindgen::__rt::RefMut;
use sha3::Digest;


// Add other modules that define Worker functionality
// Allows to split Worker logic
mod worker_login;
mod worker_registration;
mod worker_network;
mod worker_private_entries;
mod worker_changes;


/// Manages databases and performs CRUD-operations.
pub struct Worker {
    user: RefCell<Option<String>>,
    mkey: RefCell<Option<String>>,
    meta: RefCell<Option<Connection>>,
    private: RefCell<Option<Connection>>,
    // closures: RefCell<Option<ClosureStorage>>,
    service_status: RefCell<String>,
    service_closure: RefCell<Option<Closure<dyn FnMut()>>>,
    database_url: RefCell<Option<String>>,
    database_url_is_set: RefCell<bool>,
    category_cache: RefCell<HashMap<String, RecoverCategory>>,
    category_clear: RefCell<HashMap<u16, Timeout>>,
    password_cache: RefCell<HashMap<String, RecoverPassword>>,
    password_clear: RefCell<HashMap<u16, Timeout>>,
}

/// Holds one logical databases with references to the local and remote one.
/// Also, contains the changes-feed and sync-handler.
struct Connection {
    name: String,
    local_db: PouchDB,
    remote_db: Option<PouchDB>,
    changes_feed: ChangesFeed,
    sync_handler: Option<SyncHandler>,
    change_closure: Closure<dyn FnMut(JsValue)>,
    change_error_closure: Closure<dyn FnMut(JsValue)>,
    sync_closure: Closure<dyn FnMut(JsValue)>,
    sync_error_closure: Closure<dyn FnMut(JsValue)>,
}

/// Holds all database-relevant closures used by the Worker
/// Change closures are called, when somethings changes in the local database.
/// Sync closures are called, when synchronization happens between local and
/// remote database.
/// TODO remove
struct ClosureStorage {
    change_closure: Closure<dyn FnMut(JsValue)>,
    change_error_closure: Closure<dyn FnMut(JsValue)>,
    sync_closure: Closure<dyn FnMut(JsValue)>,
    sync_error_closure: Closure<dyn FnMut(JsValue)>,
    meta_closure: Closure<dyn FnMut(JsValue)>
}

impl Worker {
    /// Creates a new Worker that manages databases.
    /// This includes live syncing and methods for CRUD-operations.
    pub fn new() -> Rc<Worker> {
        // User hash and masterkey are not known at initialization
        let user = RefCell::new(None);
        let mkey = RefCell::new(None);
        // Databases will be setup later on
        let meta = RefCell::new(None);
        let private = RefCell::new(None);
        // Create worker with reference counting to enable its usage
        // in multiple parts in the application
        let worker = Rc::new(Worker {
            user,
            mkey,
            meta,
            private,
            service_status: RefCell::new(String::from("offline")),
            service_closure: RefCell::new(None),
            database_url: RefCell::new(None),
            database_url_is_set: RefCell::new(false),
            category_cache: RefCell::new(HashMap::new()),
            category_clear: RefCell::new(HashMap::new()),
            password_cache: RefCell::new(HashMap::new()),
            password_clear: RefCell::new(HashMap::new()),
        });
        // Return reference counted worker
        worker
    }

    pub async fn set_database_url(self: Rc<Worker>) {

        if is_online() {
            let result = JsFuture::from(get_database_url()).await;
            match result {
                Ok(url_raw) => {
                    let url = url_raw.as_string().unwrap();
                    log(&format!("My URL!! {}", &url));
                    self.database_url.replace(Some(url));
                    self.database_url_is_set.replace(true);
                }
                Err(_) => {
                    // TODO interval that checks if service is available again
                    log("down");
                    self.service_status.replace(String::from("down"));
                }
            }
        }
    }

    /// Starts live replication for private password entries.
    pub async fn hearbeat(self: Rc<Worker>) {
        // Define databases
        //
        // Setup meta database
        let meta = self.clone().build_connection(String::from("meta"), None);

        // Check/Write meta-data
        let user = String::from(self.user.borrow().as_ref().unwrap().as_str());
        // TODO @moritz encrypt mkey with itself
        let mkey = String::from(self.mkey.borrow().as_ref().unwrap().as_str());
        Worker::write_meta_data(&meta.local_db, user, mkey).await;

        // Add it to the worker
        let meta = Some(meta);
        self.meta.replace(meta);

        // Setup database for private password entries
        let private = self.clone().build_connection(String::from("private"), None);
        // Add it to the worker
        let private = Some(private);
        self.private.replace(private);

        /**
        // Create struct that holds all database relevant closures
        let closures = Some(ClosureStorage {
            change_closure,
            change_error_closure,
            sync_closure,
            sync_error_closure,
            meta_closure
        });
        self.closures.replace(closures);*/

        // Send all password entries to UI
        self.clone().private_entries_without_passwords().await;
    }

    /// Reset Worker to initial state.
    pub async fn reset(self: Rc<Worker>) {
        // Block is needed to drop borrowed values in order to use the replace method
        // which uses borrow_mut under the hood
        {
            // Stop changes feeds and syncs
            let private = Ref::map(self.private.borrow(), |t| {
                t.as_ref().unwrap()
            });
            private.changes_feed.cancel_changes();
            if private.sync_handler.is_some() {
                private.sync_handler.as_ref().unwrap().cancel_sync();
            }
            let meta = Ref::map(self.meta.borrow(), |t| {
                t.as_ref().unwrap()
            });
            meta.changes_feed.cancel_changes();
            if meta.sync_handler.is_some() {
                meta.sync_handler.as_ref().unwrap().cancel_sync();
            }
        }
        // Reset state
        self.user.replace(None);
        self.mkey.replace(None);
        self.private.replace(None);
    }

    fn build_and_post_message(cmd: &str, data: JsValue) {
        let msg = Array::new_with_length(2);
        msg.set(0, JsValue::from_str(cmd));
        // TODO error handling
        msg.set(1, data);
        post_message(&msg);
    }

    /// Setups local and remote database and returns them as one Connection struct.
    /// Also, binds on change events of the database to the given closures.
    fn build_connection(self: Rc<Worker>, dbtype: String, id: Option<String>) -> Connection {
        // Set connection name
        console_log!("A");
        let name = if dbtype == "private" || dbtype == "meta" {
            // private or meta database
            console_log!("B");
            dbtype.clone()
        } else {
            // remote database
            console_log!("C");
            id.unwrap().clone()
        };

        // Setup local database
        let settings = Settings { adapter: "idb".to_string() };
        let local_db_name = &format!("{}-{}", self.user.borrow().as_ref().unwrap(), &name);
        let local_db = PouchDB::new(local_db_name, &JsValue::from_serde(&settings).unwrap());

        console_log!("D");

        // With the reference to the Worker the functionality for
        // database events can be defined through closures
        //
        // Define functionality for local changes
        let worker_moved_change = self.clone();
        let dbtype_moved = dbtype.clone();

        let change_closure = if dbtype == "meta" {
            Closure::new(move |val: JsValue| {
                log("Meta Change!");
            })
        } else {
            Closure::new(move |val: JsValue| {
                let worker = worker_moved_change.clone();
                let dbtype = dbtype.clone();
                spawn_local(async move {
                    //let worker = &worker_moved_change;
                    console_log!("We have a change!");
                    console_log!("This is the change: {:?}", &val);
                    console_log!("What change? {}", &dbtype);
                    // Send all documents to ui on change
                    // TODO send only changes
                    worker.clone().private_changes(val).await;
                    //worker.clone().private_entries_without_passwords();
                });
            })
        };

        // Define functionality for error cases on local changes
        let worker_moved_error = self.clone();
        let change_error_closure = Closure::new(move |val: JsValue| {
            let worker = &worker_moved_error;
            log("EEEEEEEEEEEERRRRRRRRROOOOOOOOOOORRRRRRRRR!");
        });
        // Define functionality for remote-sync changes
        let sync_closure = Closure::new(move |val: JsValue| {
            log("Sync Change!");
        });
        // Define functionality for error cases on remote changes
        let sync_error_closure = Closure::new(move |val: JsValue| {
            log(&format!("Error {:?}", &val));
        });
        // Setup changes feed for database
        let changes_feed = local_db.changes();
        // On change functions need to be bound to the changes feed
        changes_feed.on_change(&change_closure);
        changes_feed.on_error(&change_error_closure);

        // Create variable that contains the remote database or none
        let mut remote_db = None;
        // When online, setup remote database and sync handler
        // TODO use navigator.online?
        // TODO change is_online to check if database_url is some and not none
        let sync_handler = if is_online() {
            // Init remote databases
            let remote_db_name = format!("DB-URL: {}{}-{}",
                &self.database_url.borrow().as_ref().unwrap(),
                &self.user.borrow().as_ref().unwrap(), &name);
            let remote_db_here = PouchDB::new_with_name(&remote_db_name);
            // Get Sync Handler
            let sync_handler: SyncHandler = local_db.sync(&remote_db_here);
            // Bind on change functions
            sync_handler.on_change(&sync_closure);
            sync_handler.on_error(&sync_error_closure);
            // Save new remote database
            remote_db = Some(remote_db_here);
            // Return sync handler
            Some(sync_handler)
        } else {
            None
        };

        console_log!("F");

        // Create struct that holds connection information and return it
        Connection {
            name,
            local_db,
            remote_db,
            changes_feed,
            sync_handler,
            change_closure,
            change_error_closure,
            sync_closure,
            sync_error_closure
        }
    }

    /// Writes and updates metadata.
    /// Meta-data consist of the hash of the username and the encrypted masterkey.
    async fn write_meta_data(meta_db: &PouchDB, user: String, mkey: String) {
        let result_raw = JsFuture::from(meta_db.find(&JsValue::from_serde(&json!({
            "selector": {
                "$or": [
                    {"type": "user"},
                    {"type": "mkey"}
                ]
            }
        })).unwrap())).await.unwrap();
        // Parse received entry
        let result_raw = result_raw.into_serde::<Value>().unwrap();
        let result_1 = &result_raw["docs"][0];
        let result_2 = &result_raw["docs"][1];
        console_log!("META1!: {:?}", &result_1);
        console_log!("META2!: {:?}", &result_2);

        if result_1.is_null() && result_2.is_null() {
            // No meta-data saved
            let meta_data = JsValue::from_serde(&json!([
                {"type": "mkey", "mkey": String::from(mkey)},
                {"type": "user", "user": String::from(user)}
            ])).unwrap();
            JsFuture::from(meta_db.bulk_docs(&meta_data)).await.unwrap();
        } else if result_1.is_object() && result_2.is_object() {
            // Both meta-data is saved
            let mut user_val = &Value::Null;
            let mut mkey_val = &Value::Null;
            if result_1["mkey"].is_string() {
                // result_1 is mkey, result_2 is user
                mkey_val = result_1;
                user_val = result_2;
            } else {
                mkey_val = result_2;
                user_val = result_1;
            }
            // Check if meta-data changed
            if mkey_val["mkey"].as_str().unwrap() != &mkey || user_val["user"].as_str().unwrap() != &user {
                let meta_data =
                if mkey_val["mkey"].as_str().unwrap() != &mkey && user_val["user"].as_str().unwrap() != &user {
                    // Meta-data must be updated
                    JsValue::from_serde(&json!([
                        {"type": "mkey", "mkey": String::from(mkey),
                        "_id": mkey_val["_id"], "_rev": mkey_val["_rev"]},
                        {"type": "user", "user": String::from(user),
                        "_id": user_val["_id"], "_rev": user_val["_rev"]}
                    ])).unwrap()
                } else if mkey_val["mkey"].as_str().unwrap() == &mkey && user_val["user"].as_str().unwrap() != &user {
                    // User meta-data must be updated
                    JsValue::from_serde(&json!([
                        {"type": "user", "user": String::from(user),
                        "_id": user_val["_id"], "_rev": user_val["_rev"]}
                    ])).unwrap()
                } else {
                    // Mkey meta-data must be updated
                    JsValue::from_serde(&json!([
                        {"type": "mkey", "mkey": String::from(mkey),
                        "_id": mkey_val["_id"], "_rev": mkey_val["_rev"]},
                    ])).unwrap()
                };
                JsFuture::from(meta_db.bulk_docs(&meta_data)).await.unwrap();
            }
        } else if result_1.is_object() && result_2.is_null() {
            // One field is missing
            let meta_data = if result_1["mkey"].is_string() {
                // result_1 is mkey, user meta-data is missing
                let meta_data = if result_1["mkey"].as_str().unwrap() == &mkey {
                    // mkey does not need to be updated
                    JsValue::from_serde(&json!([
                        {"type": "user", "user": String::from(user)}
                    ])).unwrap()
                } else {
                    // mkey needs update
                    JsValue::from_serde(&json!([
                        {"type": "mkey", "mkey": String::from(mkey),
                        "_id": result_1["_id"], "_rev": result_1["_rev"]},
                        {"type": "user", "user": String::from(user)}
                    ])).unwrap()
                };
                meta_data
            } else {
                // result_1 is user, mkey meta-data is missing
                let meta_data = if result_1["user"].as_str().unwrap() == &user {
                    // user does not need to be updated
                    JsValue::from_serde(&json!([
                        {"type": "mkey", "mkey": String::from(mkey)},
                    ])).unwrap()
                } else {
                    // user needs update
                    JsValue::from_serde(&json!([
                        {"type": "mkey", "mkey": String::from(mkey)},
                        {"type": "user", "user": String::from(user),
                        "_id": result_1["_id"], "_rev": result_1["_rev"]}
                    ])).unwrap()
                };
                meta_data
            };
            JsFuture::from(meta_db.bulk_docs(&meta_data)).await.unwrap();
        } else {
            // Other filed is missing
            let meta_data = if result_2["mkey"].is_string() {
                // result_2 is mkey, user meta-data is missing
                let meta_data = if result_2["mkey"].as_str().unwrap() == &mkey {
                    // mkey does not need to be updated
                    JsValue::from_serde(&json!([
                        {"type": "user", "user": String::from(user)}
                    ])).unwrap()
                } else {
                    // mkey needs update
                    JsValue::from_serde(&json!([
                        {"type": "mkey", "mkey": String::from(mkey),
                        "_id": result_2["_id"], "_rev": result_2["_rev"]},
                        {"type": "user", "user": String::from(user)}
                    ])).unwrap()
                };
                meta_data
            } else {
                // result_2 is user, mkey meta-data is missing
                let meta_data = if result_2["user"].as_str().unwrap() == &user {
                    // user does not need to be updated
                    JsValue::from_serde(&json!([
                        {"type": "mkey", "mkey": String::from(mkey)},
                    ])).unwrap()
                } else {
                    // user needs update
                    JsValue::from_serde(&json!([
                        {"type": "mkey", "mkey": String::from(mkey)},
                        {"type": "user", "user": String::from(user),
                        "_id": result_2["_id"], "_rev": result_2["_rev"]}
                    ])).unwrap()
                };
                meta_data
            };
            JsFuture::from(meta_db.bulk_docs(&meta_data)).await.unwrap();
        };
    }
}

/// Functions that return or alter Worker state
impl Worker {

    /// Return a reference to the local database for private password entries
    pub fn get_private_local_db(&self) -> Ref<PouchDB> {
        let conn = self.private.borrow();
        Ref::map(conn, |t| {
          &t.as_ref().unwrap().local_db
        })
    }

    /// Returns service/network status of the app
    pub fn get_service_status(self: Rc<Worker>) -> RefCell<String> {
        self.service_status.clone()
    }
}

trait ConnectionPlus {
    /// Sets the remote database and sync handler for the connection
    fn set_remote_db(
        &mut self, database_url: String, user: String
    );
}

impl ConnectionPlus for Connection {
    fn set_remote_db(
        & mut self, database_url: String, user: String
    ) {
        // Init remote databases
        let remote_db_name
            = format!("DB-URL: {}{}-{}", &database_url, &user, &self.name);
        let remote_db = PouchDB::new_with_name(&remote_db_name);
        // Get Sync Handler
        let sync_handler: SyncHandler = self.local_db.sync(&remote_db);
        // Bind on change functions
        sync_handler.on_change(&self.sync_closure);
        sync_handler.on_error(&self.sync_error_closure);
        // Set remote database
        self.remote_db = Some(remote_db);
        // Set sync handler
        self.sync_handler = Some(sync_handler)
    }
}