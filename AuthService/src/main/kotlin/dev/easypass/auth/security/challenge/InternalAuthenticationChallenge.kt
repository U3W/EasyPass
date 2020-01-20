package dev.easypass.auth.security.challenge

import dev.easypass.auth.security.EncryptionLibrary
import java.time.Duration
import java.time.LocalDateTime
import java.util.*

/**
 * This class is used to administer the challenges for the user authentication. This class is used in the [dev.easypass.auth.security.ChallengeAuthenticationProvider].
 * @param encryptionLibrary: this class provides the required encryption methods
 * @param properties: the application.properties as java bean
 */
class InternalAuthenticationChallenge(private val encryptionLibrary: EncryptionLibrary, private val properties: Properties) {
    private val decryptedChallenge: String = encryptionLibrary.generateAuthenticationChallenge()
    private val timeCreated: LocalDateTime = LocalDateTime.now()

    /**
     * Checks if the passed [challenge] is the same as the [decryptedChallenge], also takes the timestamp into account
     * @param challenge: the [String] that should be compared to the internal [decryptedChallenge]
     */
    fun checkChallenge(challenge: String): Boolean {
        if (isActive()) {
            return this.decryptedChallenge == challenge
        }
        return false
    }

    /**
     * Returns the internal [decryptedChallenge] encrypted by the [pubK]
     * @param pubK: the pubK to encrypt the internal [decryptedChallenge]
     */
    fun getChallengeEncryptedByPubK(pubK: String): String{
        return encryptionLibrary.encrypt(decryptedChallenge, pubK)
    }

    fun isActive(): Boolean = Duration.between(timeCreated, LocalDateTime.now()).toMillis()/1000 < properties.getProperty("auth.secondsUntilChallengeTimesOut").toInt()
}