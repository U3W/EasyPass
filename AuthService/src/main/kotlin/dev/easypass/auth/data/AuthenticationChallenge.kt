package dev.easypass.auth.data

import java.time.Duration
import java.time.LocalDateTime

class AuthenticationChallenge(val decryptedChallenge: String, private val challengeTimeout: Int = 30000, private val timeCreated: LocalDateTime = LocalDateTime.now()) {
    fun checkChallenge(challenge: String): Boolean {
        val timeDelta = Duration.between(timeCreated, LocalDateTime.now()).toMillis()
        if (timeDelta < challengeTimeout) {
            return this.decryptedChallenge == challenge
        }
        return false
    }
}