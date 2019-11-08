mod utils;

use wasm_bindgen::prelude::*;
mod crypto;
use crypto::crypto as Crypto;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn test() -> String {
    return " !!!Welcome from Rust".to_string()
}

#[wasm_bindgen]
pub struct Worker {
    msg: String
}

#[wasm_bindgen]
impl Worker {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Worker {
        utils::set_panic_hook();
        Worker { msg: "Message".to_string() }
    }

    pub fn start(&self) -> String {
        let mut test = Crypto::decrypt(&"rust");
        test = Crypto::encrypt(test);
        format!(" A {} from {}!", self.msg, test).to_string()
    }

    pub fn stop(&self) -> String {
        let mut test = Crypto::decrypt(&"rust");
        test = Crypto::encrypt(test);
        format!(" A {} from {}!", self.msg, test).to_string()
    }
}




