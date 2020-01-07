use wasm_bindgen::prelude::*;
use js_sys::{Promise};
use serde::{Deserialize, Serialize};
use wasm_bindgen_futures::{JsFuture, future_to_promise};
use serde_json::Value;

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
pub struct Temporary {
    pub adapter: String,
    pub skip_setup: bool,
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
    #[derive(Clone)]
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

    #[wasm_bindgen(method, js_class = "PouchDB", js_name = post)]
    pub fn post(this: &PouchDB, data: &JsValue) -> Promise;

    #[wasm_bindgen(method, js_class = "PouchDB", js_name = get)]
    pub fn get(this: &PouchDB, doc_id: &str) -> Promise;

    #[wasm_bindgen(method, js_class = "PouchDB", js_name = get)]
    pub fn get_with_options(this: &PouchDB, doc_id: &str, options: &JsValue) -> Promise;

    #[wasm_bindgen(method, js_class = "PouchDB", js_name = allDocs)]
    pub fn all_docs(this: &PouchDB) -> Promise;

    #[wasm_bindgen(method, js_class = "PouchDB", js_name = allDocs)]
    pub fn all_docs_with_options(this: &PouchDB, options: &JsValue) -> Promise;

    #[wasm_bindgen(method, js_class = "PouchDB", js_name = find)]
    pub fn find(this: &PouchDB, query: &JsValue) -> Promise;

    #[wasm_bindgen(method, js_class = "PouchDB", js_name = remove)]
    pub fn remove(this: &PouchDB, doc: &JsValue) -> Promise;

    #[wasm_bindgen(js_namespace = PouchDB, js_name = replicate)]
    pub fn replicate(source: &PouchDB, target: &PouchDB) -> Promise;

    #[wasm_bindgen(method, js_class = "PouchDB", js_name = sync)]
    pub fn sync(this: &PouchDB, target: &PouchDB) -> Promise;

}

impl PouchDB {
    pub fn get_conflicts(&self, doc_id: &str) -> Promise {
        let option: Value = serde_json::from_str(r#"{conflicts: true}"#).unwrap();
        self.get_with_options(doc_id, &JsValue::from_serde(&option).unwrap())
    }

    pub fn all_docs_included(&self) -> Promise {
        let option: Value = serde_json::from_str(r#"{"include_docs": true}"#).unwrap();
        self.all_docs_with_options(&JsValue::from_serde(&option).unwrap())
    }
}