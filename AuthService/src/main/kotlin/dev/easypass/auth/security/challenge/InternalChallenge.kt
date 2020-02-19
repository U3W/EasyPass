package dev.easypass.auth.security.challenge

import dev.easypass.auth.security.*
import org.springframework.security.crypto.bcrypt.*
import java.time.*
import java.util.*

/**
 * This class is used to administer the challenges for the user authentication. This class is used in the [dev.easypass.auth.security.ChallengeAuthenticationProvider].
 * @param encryptionLibrary: this class provides the required encryption methods
 * @param properties: the application.properties as java bean
 */
class InternalChallenge(private val encryptionLibrary: EncryptionLibrary, private val properties: Properties) {
    private val bCryptPasswordEncoder = BCryptPasswordEncoder()
    private val timeCreated: LocalDateTime = LocalDateTime.now()
    private var decryptedChallenge: String = ""

    /**
     * Checks if the passed [challenge] is the same as the [decryptedChallenge], also takes the timestamp into account
     * @param challenge: the [String] that should be compared to the internal [decryptedChallenge]
     * @return true if the challenge is correct
     */
    fun checkChallenge(challenge: String): Boolean {
        if (isActive()) {
            return bCryptPasswordEncoder.matches(challenge, this.decryptedChallenge)
        }
        return false
    }

    /**
     * Returns the internal [decryptedChallenge] encrypted by the [pubK]
     * @param pubK: the pubK to encrypt the internal [decryptedChallenge]
     * @return the encrypted challenge
     */
    fun getChallengeEncryptedByPubK(pubK: String): String {
        val challenge = encryptionLibrary.generateAuthenticationChallenge()
        decryptedChallenge = bCryptPasswordEncoder.encode(challenge)
        return encryptionLibrary.encrypt(challenge, pubK)
    }

    /**
     * Evaluates the time between the [timeCreated] and the current local time and compares it with the challenge timeout
     * @return true if the challenge is still active
     */
    fun isActive(): Boolean = Duration.between(timeCreated, LocalDateTime.now()).toMillis() / 1000 < properties.getProperty("auth.challengeTimeOut").toInt()
}