extern crate argon2;
extern crate base64;
extern crate sha3;
use self::argon2::Config;
use sha3::{Digest, Sha3_256};
pub fn hash_argon(string: &str, salt: String) -> String{
    let mut config = Config::default();
    config.hash_length = 64;
    let hash = argon2::hash_encoded(string.as_bytes(), salt.as_bytes(), &config).unwrap();
    return hash;
}
pub fn hash_sha3_256(password: &String) -> Vec<u8> {
    let mut hasher = Sha3_256::new(); 
    hasher.input(password.as_bytes());
    let key_hash = hasher.result();
    let key = key_hash.to_vec();
    return key;
}

