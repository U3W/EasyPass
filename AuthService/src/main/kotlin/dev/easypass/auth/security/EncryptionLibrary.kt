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
        //TODO Ein wirkliches Keypair hinzufügen
        var pubK = "DUMMY_PUBKEY"
        var privK = "DUMMY_PRIVKEY"

        return User(hash, pubK, privK)
    }

    /**
     * Generates a random [String] challenge
     */
    fun generateAuthenticationChallenge(): String {
        //TODO Challenge auswählen
        /*val allowedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
        return (1..512)
                .map { allowedChars.random() }
                .joinToString("")*/
        return "Challenge"
    }

    /**
     * Encrypts the [text] with the passed [key]
     * @param text: that should be encrypted
     * @param key: to encrypt the [text]
     */
    fun encrypt(text: String, key: String): String {
        //TODO Gescheite Encryption machen
        var encrypted = "ENCRYPTED_${text}_WITH_${key}"

        return encrypted
    }
}