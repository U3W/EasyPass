extern crate rand;
use rand::rngs::OsRng;
use rand::RngCore;
extern crate base64;
use base64::encode_config;
use base64::decode_config;
use crate::crypto::symmetric::{encrypt, decrypt, get_random_iv};
use crate::crypto::hashing::{hash_argon, hash_sha3_256};
use wasm_bindgen::__rt::std::borrow::{Borrow, BorrowMut};

pub fn generate_random_key() -> Vec<u8>{
    let mut key = [0u8; 32];
    OsRng.fill_bytes(&mut key);
    let key = &key[..];
    return key.to_vec();
}

pub fn encrypt_key(random_key: &[u8], key: &[u8]) -> String{
    let encoded = encode_config(random_key, base64::URL_SAFE);
    return encrypt(encoded.as_str(), key);
}
pub fn decrypt_key(random_key_encrypted: &str, key: &[u8]) -> Result<Vec<u8>, i32>{
    let decrypted = decrypt(random_key_encrypted, key);
    match decrypted {
        Err(e) => return Err(e),
        Ok(_) => {}
    }
    let decrypted = decrypted.unwrap();
    let decoded = decode_config(&decrypted, base64::URL_SAFE);
    match decoded {
        Ok(_) => {},
        Err(_e) => return Err(-2)
    }
    let slice = decoded.unwrap();
    return Ok(slice);
}
pub fn password_to_key(password: &str, iv: String) -> Vec<u8> {
    let argon_hash = hash_argon(password, iv);
    let hashed_hash = hash_sha3_256(&argon_hash);
    return hashed_hash;
}
pub fn password_to_new_key(password: &str) -> (Vec<u8>, String){ //unencrypted, encrypted (encryoted: iv for argon§iv%hash$encrypted)
    let mut rand_key = generate_random_key();
    let mut rand_2 = rand_key.to_vec();
    rand_2.copy_from_slice(rand_key.borrow_mut());
    let rand_key_slice = rand_key.as_slice();
    let mut iv = get_random_iv(20).to_owned();
    let key = password_to_key(password, iv.clone());
    let key = key.as_slice();
    let encrypted_key = encrypt_key(rand_key_slice, key);
    iv.push_str("§");
    iv.push_str(&encrypted_key);
    return (rand_2, iv);

}

pub fn password_to_existing_key(password: &str, encrypted_key: &str) -> Vec<u8>{ //unencrypted, encrypted
    let vec: Vec<&str> = encrypted_key.split("§").collect();
    let iv = vec[0];
    let encrypted_key = vec[1];
    let key = password_to_key(password, String::from(iv));
    let key = key.as_slice();
    let decrypted_key = decrypt_key(encrypted_key, key);
    let decrypted_key = decrypted_key.unwrap();
    return decrypted_key;
}
//returns encrypted 
pub fn change_password(new_password: &str, master_key: &[u8]) -> String{
	let mut iv = get_random_iv(20).to_owned();
    let key = password_to_key(new_password, iv.clone());
    let key = key.as_slice();
    let encrypted_key = encrypt_key(master_key, key);
    iv.push_str("§");
    iv.push_str(&encrypted_key);
    return iv;
}