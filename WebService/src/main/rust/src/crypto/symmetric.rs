use c2_chacha::ChaCha20;
use c2_chacha::stream_cipher::{NewStreamCipher, SyncStreamCipher, SyncStreamCipherSeek};
use c2_chacha::stream_cipher::generic_array::GenericArray;
use poly1305::{universal_hash::UniversalHash, Poly1305};
extern crate base64;
use std::str;
use rand::prelude::*;
use base64::encode_config;
use base64::decode_config;
// iv%hash$encrypted
pub fn encrypt(msg: &str, key: &[u8]) -> String{
    let mut iv = get_random_iv(8).to_owned();
    let encrypted = encrypt_manual(msg,key,iv.as_str()).to_owned();
    iv.push_str("%");
    iv.push_str(&encrypted);
    return iv;
}
pub fn decrypt(msg: &str, key: &[u8]) -> Result<String, i32>{
    let vec: Vec<&str> = msg.split("%").collect();
    let iv = vec[0];
    let ciphertext = vec[1];
    let decrypted = decrypt_manual(ciphertext,key,iv);
    return decrypted;
}
pub fn encrypt_manual(msg: &str, key: &[u8], iv: &str) -> String {
    let mut c2 = ChaCha20Poly1305::new(key,iv);
    c2.set_message(msg);
    c2.encryption();
    let buffer = c2.get_buffer();
    let hash = c2.get_hash();
    let mut out = to_base64(hash);
    out.push_str("$");
    out.push_str(to_base64(buffer).as_str());
    return out;
}
pub fn decrypt_manual(msg: &str, key: &[u8], iv: &str) -> Result<String, i32> {
    let mut c2 = ChaCha20Poly1305::new(key,iv);
    let v: Vec<&str> = msg.split("$").collect();
    let hash = v[0];
    let msg_vec = v[1];
    let hash = from_base64(hash);
    let msg_vec = from_base64(msg_vec);
    c2.set_buffer_vec(msg_vec);
    c2.decrypt();
    let buffer: Vec<u8> = c2.get_buffer();
    let msg_vec = v[1];
    let msg_vec = from_base64(msg_vec);
    if msg_vec.as_slice().eq(buffer.as_slice()) || c2.get_hash().ne(&hash) {
        let res : Result<String, i32> = Err(-1);
        return res;
    }
    let buffer2 = String::from_utf8(buffer);
    let buffer2 = buffer2.unwrap();
    let res : Result<String, i32> = Ok(buffer2);
    return res;
}
pub fn get_random_iv(length: usize) -> String {
    let mut alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".as_bytes().to_vec(); //this should be random enough
    let mut rng = rand::thread_rng();
    alphabet.shuffle(&mut rng);
    let (left, _right) = alphabet.split_at(length);
    let iv = String::from_utf8(Vec::from(left)).unwrap();
    return iv;
}
pub fn from_base64(message: &str) -> Vec<u8>{
    let original = decode_config(message, base64::URL_SAFE).unwrap();
    return original;
}
pub fn to_base64(message: Vec<u8>) -> String {
    let encoded =  encode_config(message.as_slice(), base64::URL_SAFE);
    return encoded;
}

pub struct ChaCha20Poly1305{
    c2chacha20: ChaCha20,
    buffer: Vec<u8>,
    poly1305: Poly1305,
    hash: Vec<u8>,
}
//TODO handle keys which are longer than 32 chars, we do want to limit useres at 64 chars or not limit them at all
impl ChaCha20Poly1305{
    pub fn new(key: &[u8], iv: &str) -> ChaCha20Poly1305{
        let (key, _right) = key.split_at(32);
        let iv = iv.as_bytes();
        let (iv, _right) = iv.split_at(8);
        let buffer = iv.to_vec();
        let c2chacha20 = ChaCha20::new_var(key, iv).unwrap();
        let key = GenericArray::from_slice(key);
        let poly1305 = Poly1305::new(key);
        let hash ="".as_bytes().to_vec();
        let encryption = ChaCha20Poly1305 {
            c2chacha20,
            buffer,
            poly1305,
            hash
        };
        return encryption;
    }

    pub fn set_message(&mut self, message: &str) -> Vec<u8>{
        let buffer = message.as_bytes();
        let buffer = buffer.to_vec();
        self.buffer = buffer;
        return self.buffer.clone();
    }

    pub fn get_hash(&mut self) -> Vec<u8> {
        return self.hash.clone();
    }

    pub fn get_buffer(&mut self) -> Vec<u8> {
        return self.buffer.clone();
    }

    pub fn set_buffer_vec(&mut self, ciphertext: Vec<u8>){
        self.buffer = ciphertext;
    }

    pub fn encryption(&mut self) {
        self.c2chacha20.apply_keystream(&mut self.buffer);
        self.poly1305.reset();
        self.poly1305.update(&mut self.buffer);
        let hash = self.poly1305.clone().result().into_bytes().to_vec();
        self.hash = hash.clone();
    }

    pub fn decrypt(&mut self) {
        self.poly1305.reset();
        self.poly1305.update(&mut self.buffer);
        let hash = self.poly1305.clone().result().into_bytes().to_vec();
        self.hash = hash.clone();
        self.c2chacha20.seek(0);
        self.c2chacha20.apply_keystream(&mut self.buffer);
    }
}