package dev.easypass.auth.staticMethods

fun encrypt(message: String, key: String): String{
    return message+key
}

fun decrypt(message: String, key: String): String{
    return message.dropLast(key.length)
}