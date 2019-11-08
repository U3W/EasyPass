use wasm_bindgen::prelude::*;
use js_sys::{Promise};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Info {
    pub adapter: String,
    pub auto_compaction: bool,
    pub db_name: String,
    pub doc_count: u32,
    pub idb_attachment_format: String,
    pub update_seq: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Settings {
    pub adapter: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthSettings {
    pub auth: Auth,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Auth {
    pub username: String,
    pub password: String,
}


#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_name = PouchDB)]
    pub type PouchDB;
    #[wasm_bindgen(constructor, js_class = "PouchDB")]
    pub fn new(db_name: &str, settings: &JsValue) -> PouchDB;

    #[wasm_bindgen(constructor, js_class = "PouchDB")]
    pub fn new_with_name(db_name: &str) -> PouchDB;

    #[wasm_bindgen(method, getter, js_class = "PouchDB")]
    pub fn adapter(this: &PouchDB) -> String;

    #[wasm_bindgen(method, js_class = "PouchDB", js_name = info)]
    pub fn info(this: &PouchDB) -> Promise;

    #[wasm_bindgen(method, js_class = "PouchDB", js_name = put)]
    pub fn put(this: &PouchDB, data: &JsValue) -> Promise;

    #[wasm_bindgen(method, js_class = "PouchDB", js_name = get)]
    pub fn get(this: &PouchDB, doc_id: &str) -> Promise;
}