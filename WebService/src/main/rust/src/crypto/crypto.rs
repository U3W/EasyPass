use crate::crypto::{symmetric, passwords, second_fa, asymmetric};
use base64::{encode_config, URL_SAFE};
// Here I provice all functionts to Kacper Urbaniec. Those functions will not be called by the crypto library
/*
chars used to concatenate strings:
symmetric encrypt + hash: $
^ + iv: %
challenge + pubKeyServer: §
master keys: §
encryptedPrivateKey + iv: §
*/
pub fn new_user(password: &str) -> (String, String){
	//TODO change parameter to string, since a password should be provided and not the master key!
	return asymmetric::new_user(password);
}
pub fn decrypt_challenge(private_key: &str, challenge: &str, password: &str) -> Result<String, i32>{
	//TODO change parameter to string, since a password should be provided and not the master key!
	return asymmetric::authenticate_user(private_key, challenge, password);
}
pub fn encrypt(msg: &str, key: &[u8]) -> String{
	return symmetric::encrypt(msg, key);
}
pub fn decrypt(msg: &str, key: &[u8]) -> Result<String, i32>{
	return symmetric::decrypt(msg, key);
}
pub fn password_to_new_key(password: &str) -> (Vec<u8>, String){ //unencrypted, encrypted
	return passwords::password_to_new_key(password);
}
pub fn password_to_existing_key(password: &str, encrypted_key: &str) -> Vec<u8>{
	return passwords::password_to_existing_key(password, encrypted_key);
}
pub fn change_password(new_password: &str, master_key: &[u8]) -> String{
	return passwords::change_password(new_password, master_key);
}
pub fn password_and_second_factor_to_key(password: &str, encrypted_master_key: &str, second_factor: &str) -> Vec<u8>{
	return second_fa::two_factors_to_key(password, encrypted_master_key, second_factor);
}
pub fn generate_new_factor(password: &str, master_key: &[u8]) -> (String, String) {//new_encrypted_key (save to db), string to put into file
	return second_fa::generate_new_factor(password, master_key);
}

pub fn hash_username(username: &str) -> String{
	//TODO test
	return encode_config(passwords::password_to_key(username, String::from("usernamesaltsstaythesame")).as_slice(), URL_SAFE);
}
pub fn asymmetric_encrypt(msg: &str, pub_key: &str) -> String{
	return asymmetric::encrypt_challenge(msg, String::from(pub_key));
}
pub fn asymmetric_decrypt(msg: &str, priv_key: &str, password: &str) -> Result<String, i32>{
	return asymmetric::authenticate_user(priv_key, msg, password);
}