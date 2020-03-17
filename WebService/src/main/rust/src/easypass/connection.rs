use crate::easypass::worker::Worker;
use crate::pouchdb::pouchdb::*;
use crate::easypass::worker::worker_crud::CRUDType;
use crate::is_online;

use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::{spawn_local};
use wasm_bindgen::__rt::std::rc::Rc;


/// Holds one logical databases with references to the local and remote one.
/// Also, contains the changes-feed and sync-handler.
/// Holds also all database-relevant closures used by the Worker
/// Change closures are called, when somethings changes in the local database.
/// Sync closures are called, when synchronization happens between local and
/// remote database.
pub struct Connection {
    pub name: String,
    pub local_db: PouchDB,
    pub remote_db: Option<PouchDB>,
    pub changes_feed: ChangesFeed,
    pub sync_handler: Option<SyncHandler>,
    pub change_closure: Closure<dyn FnMut(JsValue)>,
    pub change_error_closure: Closure<dyn FnMut(JsValue)>,
    pub sync_closure: Closure<dyn FnMut(JsValue)>,
    pub sync_error_closure: Closure<dyn FnMut(JsValue)>,
}

impl Connection {
    /// Setups local and remote database and returns them as one Connection struct.
    /// Also, binds on change events of the database to the given closures.
    pub fn build_connection(
        worker: Rc<Worker>, crudtype: CRUDType, gid: Option<String>,
        user: String, database_url: Option<String>
    ) -> Connection {
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
        let local_db_name = &format!("{}-{}", &user, &name);
        let local_db = PouchDB::new(local_db_name, &JsValue::from_serde(&settings).unwrap());

        // With the reference to the Worker the functionality for
        // database events can be defined through closures
        //
        // Define functionality for local changes
        let worker_moved_change = worker.clone();
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
        let worker_moved_error = worker.clone();
        let change_error_closure = Closure::new(move |val: JsValue| {
            let worker = &worker_moved_error;
            console_log!("EEEEEEEEEEEERRRRRRRRROOOOOOOOOOORRRRRRRRR!");
        });
        // Define functionality for remote-sync changes
        let sync_closure = Closure::new(move |val: JsValue| {
            console_log!("Sync Change!");
        });
        // Define functionality for error cases on remote changes
        let sync_error_closure = Closure::new(move |val: JsValue| {
            console_log!("Error {:?}", &val);
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
            let database_url = database_url.unwrap();

            // TODO @Kacper refactor remote_db_name for server
            //  /store/uid-meta
            //  /store/uid
            //  /store/gid

            /**
            let remote_db_name = format!("DB-URL: {}{}-{}",
                &self.database_url.borrow().as_ref().unwrap(),
                &self.user.borrow().as_ref().unwrap(), &name);*/

            let remote_db_name = Connection::build_remote_name(
                crudtype, &database_url, &name, &user
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

    /// Sets the remote database and sync handler for the connection
    pub fn set_remote_db(
        &mut self, database_url: String, user: String
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