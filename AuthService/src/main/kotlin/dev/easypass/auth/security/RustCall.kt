package dev.easypass.auth.security

internal object RustCall {

    private external fun encryptWithPubKey(input: String, pubKey: String): String?

    fun encrypt(msg: String, key: String): String {
        return encryptWithPubKey(msg, key)!!
    }

    init {
        System.loadLibrary("enc")
    }
}