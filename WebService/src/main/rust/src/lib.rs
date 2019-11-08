#![feature(in_band_lifetimes)]

mod utils;

use wasm_bindgen::prelude::*;
mod crypto;
use crypto::crypto as Crypto;
mod pouchdb;
use pouchdb::pouchdb::*;
use wasm_bindgen_futures::{spawn_local, future_to_promise};
use wasm_bindgen_futures::JsFuture;

use serde_json::{Value};
use js_sys::{Promise};
use serde::{Deserialize, Serialize};
use futures::task::LocalSpawnExt;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub struct Worker {
    db: PouchDB,
    output: String
}

#[wasm_bindgen]
impl Worker {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Worker {
        utils::set_panic_hook();
        let settings = Settings { adapter: "idb".to_string() };
        Worker { db: PouchDB::new("TestDB", &JsValue::from_serde(&settings).unwrap()),
            output: String::new() }
    }

    pub fn get_output(&self) -> String {
        String::from(self.output.as_str())
    }
}


#[wasm_bindgen]
pub async fn process(mut worker: Worker, command: String) -> Worker {
    //let promise = js_sys::Promise::resolved(&"42".into());
    //let result = wasm_bindgen_futures::JsFuture::from(promise).await;
    //Ok(JsValue::from("test"))
    log("Baum");
    //let test = JsFuture::from(worker.db.info());
    //test.await;
    /**
    spawn_local(async {
        log("Kek");
        let result = test.await;
        let end = result.unwrap().into_serde::<Info>().unwrap();
        log(&format!("{:?}", &end));
    });*/
    let output = match command.as_str() {
        "adapter" => { worker.db.adapter() }
        _ => String::from("Unknown command")
    };
    worker.output = output;
    worker
}







