extern crate rand;
extern crate base64;
extern crate x25519_dalek;
extern crate sha3;
use rand::rngs::OsRng;
use x25519_dalek::{EphemeralSecret, StaticSecret};
use x25519_dalek::PublicKey;
use base64::{encode_config, decode_config};
use sha3::{Digest, Sha3_256};
use crate::crypto::symmetric::{encrypt, decrypt};
use crate::crypto::hashing::hash_sha3_256;

pub struct Statisch{}
impl Statisch{
    pub fn create_keypair() -> (StaticSecret, PublicKey){
        let mut client_csprng = OsRng;
        let     client_secret = StaticSecret::new(&mut client_csprng);
        let     client_public = PublicKey::from(&client_secret);
        return (client_secret, client_public);
    }
    pub fn get_key(secret: StaticSecret, public: PublicKey) -> Vec<u8>{
        let secret = secret.diffie_hellman(&public);
        let mut hasher = Sha3_256::new();
        hasher.input(secret.as_bytes());
        let key_hash = hasher.result();
        let key = key_hash.to_vec();
        return key;
    }
    pub fn decrypt_secret(encrypted_secret: &str, key: &[u8]) -> StaticSecret {
        let secret = decrypt(encrypted_secret, key).unwrap();
        let secret_vec = decode_config(&secret, base64::URL_SAFE).unwrap();
        let mut secret : [u8; 32] = [0u8;32];
        secret.copy_from_slice(&secret_vec);
        let secret = StaticSecret::from(secret);
        return secret;
    }
    pub fn encrypt_secret(secret: StaticSecret, key: &[u8]) -> String {
        let secret = secret.to_bytes();
        let secret = encode_config(&secret, base64::URL_SAFE);
        let secret = secret.as_str();
        let secret = encrypt(secret, key);
        return secret;
    }
}
pub struct Empheral{}
impl Empheral{
    pub fn create_keypair() -> (EphemeralSecret, PublicKey){
        let mut client_csprng = OsRng;
        let     client_secret = EphemeralSecret::new(&mut client_csprng);
        let     client_public = PublicKey::from(&client_secret);
        return (client_secret, client_public);
    }
    pub fn get_key(secret: EphemeralSecret, public: PublicKey) -> Vec<u8>{
        let secret = secret.diffie_hellman(&public);
        let mut hasher = Sha3_256::new();
        hasher.input(secret.as_bytes());
        let key_hash = hasher.result();
        let key = key_hash.to_vec();
        return key;
    }
}

pub fn new_user(key: &[u8]) -> (String, String){ // Returns  (encryptedPrivateKey, PublicKey)
    let (secret, public) = Statisch::create_keypair();
    let public = public.as_bytes();
    let public = encode_config(public, base64::URL_SAFE);
    let secret = Statisch::encrypt_secret(secret, key);
    return (secret, public);
}
pub fn authenticate_user(secret: &str, challenge: &str, key: &[u8]) -> Result<String, i32>{
    let vec: Vec<&str> = challenge.split("§").collect();
    let server_pub = vec[0];
    let challenge = vec[1];
    let server_pub_vec = decode_config(server_pub, base64::URL_SAFE).unwrap();
    let mut server_pub : [u8; 32] = [0u8;32];
    server_pub.copy_from_slice(&server_pub_vec);
    let server_pub = PublicKey::from(server_pub);
    let secret = Statisch::decrypt_secret(secret,key);
    let key = Statisch::get_key(secret, server_pub);
    let key = key.as_slice();
    return decrypt(challenge, key);
}
pub fn encrypt_challenge(challenge: &str, pub_key: String) -> String{ //encrypted challenge
    let pub_key_vec = decode_config(&pub_key, base64::URL_SAFE).unwrap();
    let mut pub_key : [u8; 32] = [0u8;32];
    pub_key.copy_from_slice(&pub_key_vec);
    let pub_key= PublicKey::from(pub_key);
    let (secret, public) = Empheral::create_keypair();
    let key = Empheral::get_key(secret, pub_key);
    let encrypted = encrypt(challenge, key.as_slice());
    let public = public.as_bytes();
    let mut public = encode_config(public, base64::URL_SAFE);
    public.push_str("§");
    public.push_str(encrypted.as_str());
    return public;
}
