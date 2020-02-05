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

#[derive(Debug)]
pub struct RecoverPassword {
    user: String,
    passwd: String,
    url: String,
    title: String,
    tags: Vec<Value>,
    tab_id: u64,
    cat_id: String
}

impl RecoverPassword {
    pub fn new(data: &JsValue) -> RecoverPassword {
        let parsed = data.into_serde::<Value>().unwrap();
        RecoverPassword {
            user: String::from(parsed["user"].as_str().unwrap()),
            passwd: String::from(parsed["passwd"].as_str().unwrap()),
            url: String::from(parsed["url"].as_str().unwrap()),
            title: String::from(parsed["title"].as_str().unwrap()),
            tags: parsed["tags"].as_array().unwrap().to_vec(),
            tab_id: parsed["tabID"].as_u64().unwrap(),
            cat_id: String::from(parsed["catID"].as_str().unwrap())
        }
    }

    pub fn get_password_as_json(&self) -> JsValue {
        JsValue::from_serde(&json!({
            "type": "passwd",
            "user": self.user,
            "passwd": self.passwd,
            "url": self.url,
            "title": self.title,
            "tags": self.tags,
            "tabID": self.tab_id,
            "catID": self.cat_id
        })).unwrap()
    }

    pub fn set_cat_id(&mut self, cat_id: String) {
        self.cat_id = cat_id;
    }

    pub fn get_cat_id(&self) -> String {
        self.cat_id.clone()
    }
}