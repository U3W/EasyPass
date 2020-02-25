

pub fn newUser(key: &[u8]) -> (String, String){
	return asymmetric::newUser(key);
}

pub fn decryptChallenge(privateKey: &str, challenge: &str, key: &[u8]) -> Result<String, i32>{
	return asymmetic::authenticateUser(privateKey, challenge, key);
}

pub fn encrypt(msg: &str, key: &[u8]) -> String{
	return symmetric::encrypt(msg, key);
}
pub fn decrypt(msg: &str, key: &[u8]) -> Result<String, i32>{
	return symmetric::decrypt(msg, key);
}

pub fn password_to_new_key(password: &str) -> (&[u8], String){
	return passwords::password_to_new_key(password);
}
pub fn password_to_existing_key(password: &str, encrypted_key: &str) -> &[u8]{
	return passwords::password_to_existing_key(password, encrypted_key);
}