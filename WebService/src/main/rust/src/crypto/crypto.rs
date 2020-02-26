use crate::crypto::{symmetric, passwords, second_fa, asymmetric};
// Here I provice all functionts to Kacper Urbaniec. Those functions will not be called by the crypto library

pub fn new_user(key: &[u8]) -> (String, String){
	return asymmetric::new_user(key);
}
pub fn decrypt_challenge(private_key: &str, challenge: &str, key: &[u8]) -> Result<String, i32>{
	return asymmetric::authenticate_user(private_key, challenge, key);
}
pub fn encrypt(msg: &str, key: &[u8]) -> String{
	return symmetric::encrypt(msg, key);
}
pub fn decrypt(msg: &str, key: &[u8]) -> Result<String, i32>{
	return symmetric::decrypt(msg, key);
}
pub fn password_to_new_key(password: &str) -> (Vec<u8>, String){
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