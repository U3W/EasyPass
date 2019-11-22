package dev.easypass.auth.security.challenge

import dev.easypass.auth.security.EncryptionLibrary
import java.time.Duration
import java.time.LocalDateTime
import java.util.*

class InternalAdministrationChallenge(private val encryptionLibrary: EncryptionLibrary, private val properties: Properties) {
    private val decryptedChallenge: String = encryptionLibrary.generateAuthenticationChallenge()
    private val timeCreated: LocalDateTime = LocalDateTime.now()

    fun checkChallenge(challenge: String): Boolean {
        val timeDelta = Duration.between(timeCreated, LocalDateTime.now()).toMillis()
        if (timeDelta < properties.getProperty("auth.challengeTimeout").toInt()) {
            return this.decryptedChallenge == challenge
        }
        return false
    }

    fun getChallengeEncryptedByPublicKey(publicKey: String): String{
        return encryptionLibrary.encrypt(decryptedChallenge, publicKey)
    }
}