package dev.easypass.auth.security;
class RustCall {
    // This declares that the static `hello` method will be provided
    // a native library.
    private static native String encryptWithPubKey(String input, String pubKey);

    static {
        // This actually loads the shared object that we'll be creating.
        // The actual location of the .so or .dll may differ based on your
        // platform.
        System.loadLibrary("enc");
    }

    // The rest is just regular ol' Java!
    public static String encrypt(String msg, String key){
        RustCall.encryptWithPubKey(msg, key);
    }
}
