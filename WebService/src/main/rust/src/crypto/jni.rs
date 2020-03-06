extern crate jni;
// This is the interface to the JVM that we'll call the majority of our
// methods on.
use jni::JNIEnv;

// These objects are what you should use as arguments to your native
// function. They carry extra lifetime information to prevent them escaping
// this context and getting used after being GC'd.
use jni::objects::{JClass, JString};

// This is just a pointer. We'll be returning it from our function. We
// can't return one of the objects with lifetime information because the
// lifetime checker won't let us.
use jni::sys::jstring;
use crate::crypto::asymmetric;

// This keeps Rust from "mangling" the name and making it unique for this
// crate.
#[no_mangle]
pub extern "system" fn Java_RustCall_encryptWithPubKey(env: JNIEnv, class: JClass, input: JString, pubKey: JString)
                                                         -> jstring {
    let input: String =
        env.get_string(input).expect("Couldn't get java string!").into();
    let pubKey: String =
        env.get_string(pubKey).expect("Couldn't get java string!").into();

    let output = env.new_string(asymmetric::encrypt_challenge(input.as_str(), pubKey)).expect("Couldn't create java string!");

    output.into_inner()
}
#[no_mangle]
pub extern "system" fn Java_RustCall_generateRandomChallenge(env: JNIEnv, class: JClass, input: JString)
                                                       -> jstring {
    let input: String =
        env.get_string(input).expect("Couldn't get java string!").into();


    let output = env.new_string(asymmetric::fake_challenge(input.as_str())).expect("Couldn't create java string!");

    output.into_inner()
}