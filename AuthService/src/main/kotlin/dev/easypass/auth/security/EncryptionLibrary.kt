package dev.easypass.auth.security

import dev.easypass.auth.datstore.document.*
import dev.easypass.auth.security.challenge.*
import org.springframework.stereotype.*
import java.util.*

/**
 * Provides a variety of different security methods
 * @param properties: the application.properties as java bean
 */
@Component
class EncryptionLibrary(private val properties: Properties) {
    /**
     * Generates an object of the class [InternalChallenge]
     */
    fun generateInternalAdministrationChallenge(): InternalChallenge {
        return InternalChallenge(this, properties)
    }

    /**
     * Generates an object of the class [User] with random values
     */
    fun generateDummyUser(hash: String): User {
        return User(hash, randomString(15), randomString(15))
    }

    /**
     * Generates a random [String] challenge
     */
    fun generateAuthenticationChallenge(): String {
        return randomString(properties.getProperty("auth.challengeLength").toInt())
    }

    /**
     * Encrypts the [msg] with the passed [key]
     * @param msg: that should be encrypted
     * @param key: to encrypt the [msg]
     */
    fun encrypt(msg: String, key: String): String {
        return msg+"_ENC_"+key
        //return RustCall.encrypt(msg, key)
    }

    fun randomString(len: Int): String {
        val allowedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
        return (1..len)
                .map { allowedChars.random() }
                .joinToString("")
    }
}