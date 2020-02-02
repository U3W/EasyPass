use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    /// setTimeoutWorker is equal to setTimeout but uses "self" instead of this
    /// for the scope, which is needed in Web Workers.
    /// Code can be found under "modules/easypass-lib".
    fn setTimeoutWorker(closure: &Closure<dyn FnMut()>, millis: i32) -> i32;
    /// clearTimeoutWorker is equal to clearTimeout but uses "self" instead of this
    /// for the scope, which is needed in Web Workers.
    /// Code can be found under "modules/easypass-lib".
    fn clearTimeoutWorker(token: i32);

    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub struct Timeout {
    closure: Closure<dyn FnMut()>,
    token: i32,
}

impl Timeout {
    pub fn new<F: 'static>(f: F, millis: i32) -> Timeout
        where
            F: FnMut()
    {
        // Construct a new closure.
        let closure = Closure::new(f);

        // Pass the closuer to JS
        let token = setTimeoutWorker(&closure, millis);

        Timeout { closure, token }
    }
}

// When the Timeout is destroyed, cancel its `setTimeout` timer.
impl Drop for Timeout {
    fn drop(&mut self) {
        clearTimeoutWorker(self.token);
    }
}