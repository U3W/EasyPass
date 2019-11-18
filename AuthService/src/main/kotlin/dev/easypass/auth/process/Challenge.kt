package dev.easypass.auth.process
import dev.easypass.auth.process.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.time.Duration
import java.time.LocalDateTime
import java.util.*

@Component
class Challenge(properties: Properties) {
    private var challengeTimeout: Int = properties.getProperty("auth.challenge.Timeout")?.toInt()!!
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
