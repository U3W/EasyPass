package dev.easypass.auth.process

import dev.easypass.auth.repositories.User

fun generateChallenge(): String{
    return "-Challenge-"
}

fun encryptChallenge(decryptedChallenge: String, publicKey: String): String{
    return decryptedChallenge+publicKey
}

fun generateDummyUser(): User {
    return User("dummy", "-DummyPublicKey-", "-DummyPrivateKey-")
}