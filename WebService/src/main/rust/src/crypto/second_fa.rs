use crate::crypto::{passwords, asymmetric};
use base64::{encode_config, decode_config};
use crate::crypto::crypto::{encrypt, decrypt};
use crate::crypto::asymmetric::{Statisch};
use crate::crypto::symmetric::get_random_iv;
use x25519_dalek::PublicKey;

pub fn generate_new_factor(password: &str, master_key: &[u8]) -> (String, String) { //new_encrypted_key (save to db), string to put into file
    let pass = passwords::change_password(password, master_key);
    let (priv_key_1, pub_key_1) = Statisch::create_keypair();
    let (priv_key_2, pub_key_2) = Statisch::create_keypair();
    let key_1 = Statisch::get_key(priv_key_1.clone(),pub_key_2);
    let key_2 = Statisch::get_key(priv_key_2.clone(),pub_key_1);
    assert_eq!(key_1, key_2);
    let encrypted_encoded_pass = encrypt(pass.as_str(), key_1.as_slice());
    let mut iv = get_random_iv(20).to_owned();
    let key = passwords::password_to_key(password, iv.clone());
    let key = key.as_slice();
    let encrypted_secret_1 = Statisch::encrypt_secret(priv_key_1, key);
    let encrypted_secret_2 = Statisch::encrypt_secret(priv_key_2, key);
    iv.push_str("§");
    iv.push_str(encrypted_secret_1.as_str());
    iv.push_str("§");
    iv.push_str(encrypted_secret_2.as_str());
    return (encrypted_encoded_pass, iv);
}
pub fn two_factors_to_key(password: &str, encrypted_master_key: &str, second_factor: &str) -> Vec<u8>{
    let vec: Vec<&str> = second_factor.split("§").collect();
    let iv = vec[0];
    let encrypted_priv_1 = vec[1];
    let encrypted_priv_2 = vec[2];
    let key = passwords::password_to_key(password, String::from(iv.clone()));
    let key = key.as_slice();
    let priv_key_1 = Statisch::decrypt_secret(encrypted_priv_1, key);
    let priv_key_2 = Statisch::decrypt_secret(encrypted_priv_2, key);
    let pub_key_1 = PublicKey::from(&priv_key_1);
    let pub_key_2 = PublicKey::from(&priv_key_2);
    let key_1 = Statisch::get_key(priv_key_1.clone(),pub_key_2);
    let key_2 = Statisch::get_key(priv_key_2.clone(),pub_key_1);
    assert_eq!(key_1, key_2);

    let decrypted_pass = decrypt(encrypted_master_key, key_1.as_slice());
    let pass = decrypted_pass.unwrap();
    let pass = passwords::password_to_existing_key(password, pass.as_str());
    return pass;

}