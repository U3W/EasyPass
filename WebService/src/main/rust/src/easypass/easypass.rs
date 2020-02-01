use wasm_bindgen::JsValue;
use serde_json::Value;

#[derive(Debug)]
pub struct Category {
    name: String,
    desc: String,
    tab_id: u64
}

impl Category {
    pub fn new(data: &JsValue) -> Category {
        let parsed = data.into_serde::<Value>().unwrap();
        Category {
            name: String::from(parsed["name"].as_str().unwrap()),
            desc: String::from(parsed["desc"].as_str().unwrap()),
            tab_id: parsed["tabID"].as_u64().unwrap()
        }
    }
}

#[derive(Debug)]
pub struct RecoverCategory {
    category: Category,
    entries: Vec<(String, String)>
}

impl RecoverCategory {
    pub fn new(category: Category, entries: Vec<(String, String)>) -> RecoverCategory {
        RecoverCategory {
            category,
            entries
        }
    }
}