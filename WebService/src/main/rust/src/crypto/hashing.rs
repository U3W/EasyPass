extern crate argon2;
extern crate base64;

pub fn hash(string: &str, salt: String) -> String{
    let salz = salt.get_byte;
    let mut config = Config::default();
    config.hash_length = 32;
    let mut hash = argon2::hash_encoded(string, salt, &config).unwrap();
    return hash;
}



pub fn getKeyFromPassword(password: &str, salt: String) -> &[u8] {
    let salz = salt.get_byte;
    let mut config = Config::default();
    config.hash_length = 32;
    let mut hash = argon2::hash_raw(string, salt, &config).unwrap();
    return hash;
}