use c2_chacha::ChaCha20;
use c2_chacha::stream_cipher::{NewStreamCipher, SyncStreamCipher, SyncStreamCipherSeek};
use c2_chacha::stream_cipher::generic_array::GenericArray;
use wasm_bindgen::prelude::*;
use poly1305::{universal_hash::UniversalHash, Poly1305, KEY_SIZE};
extern crate base64;
use std::str;

pub fn encrypt(msg: &str) -> String {
    let key = "an example very very secret key.";
    let iv = get_random_iv();
    let mut c2 = ChaCha20Poly1305::new(key,iv);
    c2.set_plaintext(msg);
    c2.encryption();
    let buffer = c2.get_buffer();
    return to_bas64(buffer);
}

pub fn decrypt(msg: &str) -> Result<String, i32> {
    let key = "";
    let iv = "";
    let mut c2 = ChaCha20Poly1305::new(key,iv);
    let msg_vec = from_base64(msg);
    c2.set_buffer_vec(msg_vec);
    c2.decrypt();
    let mut buffer: Vec<u8> = c2.get_buffer();
    let msg_vec = from_base64(msg);
    if msg_vec.as_slice().eq(buffer.as_slice()) {
        let res : Result<String, i32> = Err(-1);
        return res;
    }
    let buffer2 = String::from_utf8(buffer);
    let buffer2 = buffer2.unwrap();
    let res : Result<String, i32> = Ok(buffer2);
    return res;
}

pub fn get_random_iv<'a>() -> &'a str {
    return "some random iv which is way too long";
}

pub fn from_base64(message: &str) -> Vec<u8>{
    let original = base64::decode(message).unwrap();
    return original;
}
pub fn to_bas64(message: Vec<u8>) -> String {
    let encoded =  base64::encode(message.as_slice());
    return encoded;
}

pub struct ChaCha20Poly1305{
    c2chacha20: ChaCha20,
    buffer: Vec<u8>,
    poly1305: Poly1305,
}
impl ChaCha20Poly1305{
    pub fn new(key: &str, iv: &str) -> ChaCha20Poly1305{
        let key = key.as_bytes();
        let (key, _right) = key.split_at(32);
        let iv = iv.as_bytes();
        let (iv, _right) = iv.split_at(8);
        let mut buffer = iv.to_vec();
        let c2chacha20 = ChaCha20::new_var(key, iv).unwrap();
        let key = GenericArray::from_slice(key);
        let poly1305 =  Poly1305::new(key);
        let encryption = ChaCha20Poly1305 {
            c2chacha20,
            buffer,
            poly1305
        };
        return encryption;
    }

    pub fn set_plaintext(&mut self, message: &str) {
        let buffer = message.as_bytes();
        let buffer = buffer.to_vec();
        self.buffer = buffer;
    }

    pub fn set_buffer_vec(&mut self, vector: Vec<u8>){
        self.buffer = vector;
    }

    pub fn get_buffer(&mut self) -> Vec<u8>{
        return self.buffer.clone();
    }

    pub fn encryption(&mut self) {
        self.c2chacha20.apply_keystream(&mut self.buffer);
        self.poly1305.reset();
        self.poly1305.update(&mut self.buffer);
        let mut hash = self.poly1305.clone().result().into_bytes().to_vec();
        //TODO append 16 char hash to encrypted stuff
        self.buffer.append(&mut hash);
    }

    pub fn decrypt(&mut self){

        let (ciphertext, _right) = self.buffer.split_at(self.buffer.len()-16);
        self.buffer  = ciphertext.to_vec().clone();
        let (_left, mac) = self.buffer.split_at(self.buffer.len()-16);
        let mac = mac.to_vec();
        //TODO get 16 chars from hash and compare it
        self.poly1305.reset();
        self.poly1305.update(&mut self.buffer);
        let mut hash = self.poly1305.clone().result().into_bytes().to_vec();

        if hash.as_slice().eq(mac.as_slice()) {
            self.c2chacha20.seek(0);
            self.c2chacha20.apply_keystream(&mut self.buffer);
        }

    }
}