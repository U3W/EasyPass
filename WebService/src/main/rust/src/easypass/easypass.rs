use wasm_bindgen::JsValue;
use serde_json::{Value, Map};
use serde_json::json;

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

    pub fn as_json(&self) -> JsValue {
        JsValue::from_serde(&json!({
            "type": "cat",
            "name": self.name,
            "desc": self.desc,
            "tabID": self.tab_id
        })).unwrap()
    }
}

#[derive(Debug)]
pub struct RecoverCategory {
    category: Category,
    entries: Vec<String>
}

impl RecoverCategory {
    pub fn new(category: Category, entries: Vec<String>) -> RecoverCategory {
        RecoverCategory {
            category,
            entries
        }
    }

    /// Returns the saved category as JsValue
    pub fn get_category_as_json(&self) -> JsValue {
        self.category.as_json()
    }

    /// Returns a vec containing all saved entries.
    pub fn get_entries(&self) -> Vec<String> {
        self.entries.to_owned()
    }
}