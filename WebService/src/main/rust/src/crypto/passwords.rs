extern crate rand;
use rand::rngs::OsRng;
use rand::RngCore;
extern crate base64;
use base64::encode_config;
use base64::decode_config;

use hashing::hash_argon;
use hashing::hash_sha3_256;

pub fn random_key() -> &[u8]{
	let mut key : [u8;32] = [0u8;32];
    OsRng::fill_bytes(&mut OsRng,&mut key);
}

pub fn encrypt_key(random_key: &[u8], key: &[u8]) -> String{
    let mut encoded = encode_config(random_key, base64::URL_SAFE);
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

pub fn password_to_new_key(password: &str) -> (&[u8], String){ //unencrypted, encrypted (encryoted: iv for argon§iv%hash$encrypted)
    let rand_key: &[u8] = random_key();
    let mut iv = get_random_iv(20).to_owned();
    let argon_hash = hash_argon(password, iv);
    let hashed_hash = hash_sha3_256(argon_hash);
    let key = hashed_hash.as_slice();
    let encrypted_key = encrypt_key(rand_key, key);
    iv.push_str("§");
    iv.push_str(encrypted_key);
    return (rand_key, iv);

}

pub fn password_to_existing_key(password: &str, encrypted_key: &str) -> &[u8]{ //unencrypted, encrypted
    let vec: Vec<&str> = encrypted_key.split("§").collect();
    let iv = vec[0];
    let encrypted_key = vec[1];
    let argon_hash = hash_argon(password, iv);
    let hashed_hash = hash_sha3_256(argon_hash);
    let key = hashed_hash.as_slice();
    let decrypted_key = decrypt_key(encrypted_key, key);
    let decrypted_key = decrypted_key.unwrap();
    return decrypted_key;
}
//returns encrypted 
pub fn change_password(new_password: &str, master_key: &[u8]) -> String{
	let mut iv = get_random_iv(20).to_owned();
    let argon_hash = hash_argon(password, iv);
    let hashed_hash = hash_sha3_256(argon_hash);
    let key = hashed_hash.as_slice();
    let encrypted_key = encrypt_key(master_key, key);
    iv.push_str("§");
    iv.push_str(encrypted_key);
    return (rand_key, iv);
}