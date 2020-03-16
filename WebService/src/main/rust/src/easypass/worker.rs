
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
use crate::easypass::worker::worker_crud::CRUDType;


// Add other modules that define Worker functionality
// Allows to split Worker logic
mod worker_login;
mod worker_registration;
mod worker_network;
mod worker_crud;
mod worker_meta_entries;
mod worker_private_entries;
mod worker_group_entries;
mod worker_changes;


/// Manages databases and performs CRUD-operations.
pub struct Worker {
    user: RefCell<Option<String>>,
    mkey: RefCell<Option<String>>,
    group_keys: RefCell<HashMap<String, String>>,
    meta: RefCell<Option<Connection>>,
    private: RefCell<Option<Connection>>,
    groups: RefCell<HashMap<String, Connection>>,
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
/// Holds also all database-relevant closures used by the Worker
/// Change closures are called, when somethings changes in the local database.
/// Sync closures are called, when synchronization happens between local and
/// remote database.
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


impl Worker {
    /// Creates a new Worker that manages databases.
    /// This includes live syncing and methods for CRUD-operations.
    pub fn new() -> Rc<Worker> {
        // User hash and masterkey are not known at initialization
        let user = RefCell::new(None);
        let mkey = RefCell::new(None);
        let group_keys = RefCell::new(HashMap::new());
        // Databases will be setup later on
        let meta = RefCell::new(None);
        let private = RefCell::new(None);
        let groups = RefCell::new(HashMap::new());
        // Create worker with reference counting to enable its usage
        // in multiple parts in the application
        let worker = Rc::new(Worker {
            user,
            mkey,
            group_keys,
            meta,
            private,
            groups,
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
        let meta = self.clone().build_connection(CRUDType::Meta, None);

        // Check/Write meta-data
        let user = String::from(self.user.borrow().as_ref().unwrap().as_str());
        // TODO @moritz encrypt mkey with itself
        let mkey = String::from(self.mkey.borrow().as_ref().unwrap().as_str());
        Worker::write_meta_data(&meta.local_db, user, mkey).await;

        // Add it to the worker
        let meta = Some(meta);
        self.meta.replace(meta);

        // Setup database for private password entries
        let private = self.clone().build_connection(CRUDType::Private, None);
        // Add it to the worker
        let private = Some(private);
        self.private.replace(private);

        // Setup known group databases
        // Get group meta-data from meta-database
        let saved_groups = self.clone().get_groups().await;
        let mut groups = self.groups.borrow_mut();
        console_log!("SAVED GROUPS: ");
        // Setup database for every group
        for group in saved_groups {
            console_log!("GROUP: {}", &group);
            let gid = String::from(group["gid"].as_str().unwrap());
            let id = String::from(group["_id"].as_str().unwrap());
            let connection
                = self.clone().build_connection(CRUDType::Group, Some(gid));
            groups.insert(id, connection);
            // TODO @Kacper setup keys for group-databases!

            // TODO @Kacper send entries to ui
        }
        console_log!("SAVED GROUPS length: {}", &groups.len());

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
    fn build_connection(self: Rc<Worker>, crudtype: CRUDType, gid: Option<String>) -> Connection {
        // Set connection name
        let name = if crudtype == CRUDType::Meta {
            // meta database
            String::from("meta")
        } else if crudtype == CRUDType::Private {
            // private database
            String::from("private")
        } else {
            // group database
            gid.unwrap().clone()
        };

        // Setup local database
        let settings = Settings { adapter: "idb".to_string() };
        let local_db_name = &format!("{}-{}", self.user.borrow().as_ref().unwrap(), &name);
        let local_db = PouchDB::new(local_db_name, &JsValue::from_serde(&settings).unwrap());

        // With the reference to the Worker the functionality for
        // database events can be defined through closures
        //
        // Define functionality for local changes
        let worker_moved_change = self.clone();
        let dbtype_moved = crudtype.clone();

        let change_closure = if crudtype == CRUDType::Meta {
            Closure::new(move |val: JsValue| {
                let worker = worker_moved_change.clone();
                spawn_local(async move {
                    worker.clone().meta_changes(val).await;
                });
            })
        } else if crudtype == CRUDType::Private {
            Closure::new(move |val: JsValue| {
                let worker = worker_moved_change.clone();
                let dbtype = crudtype.clone();
                spawn_local(async move {
                    //let worker = &worker_moved_change;
                    console_log!("We have a change!");
                    console_log!("This is the change: {:?}", &val);
                    console_log!("What change? {:?}", &dbtype);
                    // Send all documents to ui on change
                    // TODO send only changes
                    worker.clone().private_changes(val).await;
                    //worker.clone().private_entries_without_passwords();
                });
            })
        } else {
            Closure::new(move |val: JsValue| {
                let worker = worker_moved_change.clone();
                let dbtype = crudtype.clone();
                spawn_local(async move {
                    //let worker = &worker_moved_change;
                    console_log!("We have a change!");
                    console_log!("This is the change: {:?}", &val);
                    console_log!("What change? {:?}", &dbtype);
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
        let sync_handler = if is_online() {
            // Init remote databases

            // TODO @Kacper refactor remote_db_name for server
            //  /store/uid-meta
            //  /store/uid
            //  /store/gid

            /**
            let remote_db_name = format!("DB-URL: {}{}-{}",
                &self.database_url.borrow().as_ref().unwrap(),
                &self.user.borrow().as_ref().unwrap(), &name);*/

            let remote_db_name = Worker::build_remote_name(
                crudtype, &self.database_url.borrow().as_ref().unwrap(), &name,
                &self.user.borrow().as_ref().unwrap()
            );

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

    /// [name] - "private", "meta" or group-id
    fn build_remote_name(
        crudtype: CRUDType, database_url: &str, name: &str, uname: &str
    ) -> String {
        let remote_db_name = if crudtype == CRUDType::Meta || crudtype == CRUDType::Private {
            format!("{}{}-{}", database_url, uname, name)
        } else {
            format!("{}{}", database_url, name)
        };
        remote_db_name
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

    /// Return a reference to the local database for meta entries
    pub fn get_meta_local_db(&self) -> Ref<PouchDB> {
        let conn = self.meta.borrow();
        Ref::map(conn, |t| {
            &t.as_ref().unwrap().local_db
        })
    }

    /// Return a reference to the local database for a groups password entries
    pub fn get_group_local_db(&self, gid: &str) -> Ref<PouchDB> {
        let map = self.groups.borrow();
        Ref::map(map, |t| {
            &t.get(gid).as_ref().unwrap().local_db
        })
    }

    pub fn get_group_key(&self, gid: &str) -> String {
        let keys = self.group_keys.borrow();
        String::from(keys.get(gid).unwrap())
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