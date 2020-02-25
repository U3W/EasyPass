package dev.easypass.auth.security.challenge

import dev.easypass.auth.security.*
import org.springframework.security.crypto.bcrypt.*
import java.time.*
import java.util.*

class InternalChallenge(private val encryptionLibrary: EncryptionLibrary, private val properties: Properties) {
    private val bCryptPasswordEncoder = BCryptPasswordEncoder()
    private val timeCreated: LocalDateTime = LocalDateTime.now()
    private var decryptedChallenge: String = ""

    fun checkChallenge(challenge: String): Boolean {
        if (isActive()) {
            return bCryptPasswordEncoder.matches(challenge, this.decryptedChallenge)
        }
        return false
    }

    fun getChallengeEncryptedByPubK(pubK: String): String {
        val challenge = encryptionLibrary.generateAuthenticationChallenge()
        decryptedChallenge = bCryptPasswordEncoder.encode(challenge)
        return encryptionLibrary.encrypt(challenge, pubK)
    }

    fun isActive(): Boolean = Duration.between(timeCreated, LocalDateTime.now()).toMillis() / 1000 < properties.getProperty("auth.challengeTimeOut").toInt()
}