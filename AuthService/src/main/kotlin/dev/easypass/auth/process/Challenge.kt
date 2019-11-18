package dev.easypass.auth.process
import dev.easypass.auth.process.*
import java.time.Duration
import java.time.LocalDateTime

class Challenge(private var challengeTimeout: Int) {
    private var decryptedChallenge: String = generateChallenge()
    private var timeCreated: LocalDateTime = LocalDateTime.now()

    fun checkChallenge(challenge: String): Boolean {
        val timeDelta = Duration.between(timeCreated, LocalDateTime.now()).toMillis()
        if (timeDelta < challengeTimeout) {
            return this.decryptedChallenge == challenge
        }
        return false
    }

    fun getEncryptedChallenge(publicKey: String): String {
        return encryptChallenge(decryptedChallenge, publicKey)
    }
}
