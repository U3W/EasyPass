
use crate::easypass::timeout::*;
use crate::pouchdb::pouchdb::*;
use crate::easypass::connection::Connection;
use crate::{is_online, get_node_mode, get_database_url, post_message, log};
use crate::easypass::recovery::{RecoverCategory, RecoverPassword};
use crate::easypass::formats::CRUDType;

use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use wasm_bindgen::__rt::std::rc::Rc;
use wasm_bindgen::__rt::core::cell::{RefCell, Ref};
use wasm_bindgen::__rt::std::collections::HashMap;
use js_sys::{Array};
use crate::easypass::group_keys::GroupKeys;

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
    group_keys: RefCell<HashMap<String, GroupKeys>>,
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

    /// Starts live replication for private password entries.
    pub async fn hearbeat(self: Rc<Worker>) {
        // Define databases
        //
        // Setup meta database
        let meta = Connection::build_connection(
            self.clone(), CRUDType::Meta, None,
            self.get_user(), self.get_database_url());

        // Check/Write meta-data
        let user = String::from(self.user.borrow().as_ref().unwrap().as_str());
        // TODO @moritz encrypt mkey with itself
        let mkey = String::from(self.mkey.borrow().as_ref().unwrap().as_str());
        Worker::write_meta_data(&meta.local_db, user, mkey).await;

        // Add it to the worker
        let meta = Some(meta);
        self.meta.replace(meta);

        // Setup database for private password entries
        let private = Connection::build_connection(
            self.clone(), CRUDType::Private, None,
            self.get_user(), self.get_database_url());
        // Add it to the worker
        let private = Some(private);
        self.private.replace(private);
        // Send all password entries to UI
        self.clone().private_entries_without_passwords().await;

        // Setup known group databases
        // Get group meta-data from meta-database
        let saved_groups = self.clone().get_groups().await;
        console_log!("SAVED GROUPS: ");
        // Setup database for every group
        for group in saved_groups {
            console_log!("GROUP: {}", &group);
            let id = String::from(group["_id"].as_str().unwrap());
            let gid = String::from(group["gid"].as_str().unwrap());
            let gmk = String::from(group["gmk"].as_str().unwrap());
            let amk = if !group["amk"].is_null() {
                Some(String::from(group["amk"].as_str().unwrap()))
            } else {
                None
            };
            self.clone().setup_new_group(id, gid, gmk, amk);

            // TODO @Kacper send entries to ui
        }

        console_log!("SAVED GROUPS length: {}", &self.groups.borrow().len());
    }

    /// Tries to fetch the URL to the EasyPass-Auth-Service.
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

    /// Sends a message and data in form of a Js-Array to the UI-thread.
    fn build_and_post_message(cmd: &str, data: JsValue) {
        let msg = Array::new_with_length(2);
        msg.set(0, JsValue::from_str(cmd));
        // TODO error handling
        msg.set(1, data);
        post_message(&msg);
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
        self.group_keys.borrow_mut().clear();
        self.group_keys.replace(HashMap::new());
        self.private.replace(None);
        self.meta.replace(None);
        self.groups.borrow_mut().clear();
        self.groups.replace(HashMap::new());
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
        String::from(keys.get(gid).unwrap().gmk())
    }

    pub fn get_user(&self) -> String {
        self.user.borrow().as_ref().unwrap().clone()
    }

    pub fn get_database_url(&self) -> Option<String> {
        if self.database_url_is_set.borrow().eq(&true) {
            Some(self.database_url.borrow().as_ref().unwrap().clone())
        } else {
            None
        }
    }

    /// Returns service/network status of the app
    pub fn get_service_status(self: Rc<Worker>) -> RefCell<String> {
        self.service_status.clone()
    }
}