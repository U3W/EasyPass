use web_sys::{Request, RequestInit, RequestMode, Response, WorkerGlobalScope};
use wasm_bindgen_futures::JsFuture;
use wasm_bindgen::JsValue;
use serde_json::Value;


pub async fn get_auth_service_url() -> Result<String, String> {
    // Build request
    let mut opts = RequestInit::new();
    opts.method("GET");
    opts.mode(RequestMode::Cors);
    let url = "http://localhost:8090/service";
    let request = Request::new_with_str_and_init(&url, &opts).unwrap();
    request
        .headers()
        .set("Accept", "application/json");
    // Get worker scope
    let this: WorkerGlobalScope = WorkerGlobalScope::from(JsValue::from(js_sys::global()));
    // Perform fetch
    let response = JsFuture::from(this.fetch_with_request(&request)).await;
    // Check and return response
    if response.is_ok() {
        let response: Response = Response::from(response.unwrap());
        let json = JsFuture::from(response.json().unwrap()).await.unwrap();
        let json = json.into_serde::<Value>().unwrap();
        Ok(json["url"].as_str().unwrap().parse().unwrap())
    } else {
        Err(response.unwrap().as_string().unwrap())
    }
}