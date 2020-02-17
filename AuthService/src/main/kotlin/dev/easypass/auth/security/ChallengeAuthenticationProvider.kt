package dev.easypass.auth.security

import dev.easypass.auth.datstore.repository.*
import dev.easypass.auth.security.challenge.*
import dev.easypass.auth.security.exception.*
import dev.easypass.auth.security.mapper.*
import org.ektorp.*
import org.springframework.security.authentication.*
import org.springframework.security.core.*
import org.springframework.security.core.authority.*
import org.springframework.security.web.authentication.*
import org.springframework.stereotype.*
import java.time.*
import java.util.*
import kotlin.collections.ArrayList
import kotlin.collections.HashMap

/**
 * Enables the authentication with challenges
 * @param userRepository: provides the required database support to administer [dev.easypass.auth.datstore.document.User] objects
 * @param encryptionLibrary: this class provides the required encryption methods
 */
@Component
class ChallengeAuthenticationProvider(private val userRepository: UserRepository,
                                      private val groupRepository: GroupRepository,
                                      private val encryptionLibrary: EncryptionLibrary,
                                      private val properties: Properties) : AuthenticationProvider {
    private val currentChallenges = HashMap<Pair<String, String>, Pair<InternalChallenge, String>>()
    private var attemptCounter = HashMap<Pair<String, String>, Pair<Int, LocalDateTime>>()

    /**
     * Checks if the user credentials are correct
     * @param authentication: the [Authentication] which contains the user credentials
     */
    @Throws(AuthenticationException::class)
    override fun authenticate(authentication: Authentication): Authentication? {
        val key = Pair((authentication.details as WebAuthenticationDetails).remoteAddress, authentication.name)
        val pwd = authentication.credentials.toString()
        if (currentChallenges[key] == null || !currentChallenges[key]!!.first.isActive()) {
            loginFailed(key)
            throw NoActiveChallengeException()
        } else if (isBlocked(key)) {
            loginFailed(key)
            throw UserIsBlockedException()
        } else if (!currentChallenges[key]!!.first.checkChallenge(pwd)) {
            loginFailed(key)
            throw BadCredentialsException("Wrong credentials provided")
        } else {
            val authorities = ArrayList<GrantedAuthority>(authentication.authorities)
            authorities.add(SimpleGrantedAuthority("${currentChallenges[key]?.second}_${key.second}"))
            loginSucceeded(key)
            return UsernamePasswordAuthenticationToken(key.second, pwd, authorities)
        }
    }

    /**
     * Checks if the given token is supported by the application
     * @param authentication: the token-object to be verified
     */
    override fun supports(authentication: Class<*>): Boolean {
        return authentication == UsernamePasswordAuthenticationToken::class.java
    }

    fun loginSucceeded(key: Pair<String, String>) {
        currentChallenges.remove(key)
        attemptCounter.remove(key)
    }

    fun loginFailed(key: Pair<String, String>) {
        currentChallenges.remove(key)
        if (attemptCounter[key] == null)
            attemptCounter[key] = Pair(1, LocalDateTime.now())
        else
            attemptCounter[key] = Pair(attemptCounter[key]!!.first + 1, LocalDateTime.now())
    }

    fun isBlocked(key: Pair<String, String>): Boolean {
        if (attemptCounter[key] != null) {
            if (Duration.between(attemptCounter[key]!!.second, LocalDateTime.now()).toMillis() / 1000 >= properties.getProperty("auth.secondsAfterAttemptsAreReset").toInt())
                attemptCounter.remove(key)
            else if (attemptCounter[key]!!.first > properties.getProperty("auth.allowedWrongAttempts").toInt())
                return true
        }
        return false
    }

    /**
     * Adds a new [InternalChallenge] to the [currentChallenges]
     * @param uid: the name of the user
     */
    fun addChallenge(key: Pair<String, String>, role: String): ResponseChallenge = try {
        if (currentChallenges.keys.contains(key)) {
            if (currentChallenges[key]!!.first.isActive())
                throw DocumentNotFoundException("A Dummy User will be created in the Catch-Block!")
            else
                currentChallenges.remove(key)
        }
        when (role) {
            "USER"           -> {
                val user = userRepository.findOneByUid(key.second)
                currentChallenges[key] = Pair(encryptionLibrary.generateInternalAdministrationChallenge(), role)
                ResponseChallenge(currentChallenges[key]!!.first.getChallengeEncryptedByPubK(user.pubK), user.privK)
            }
            "GROUP", "ADMIN" -> {
                val group = groupRepository.findOneByGid(key.second)
                currentChallenges[key] = Pair(encryptionLibrary.generateInternalAdministrationChallenge(), role)
                ResponseChallenge(currentChallenges[key]!!.first.getChallengeEncryptedByPubK(group.pubK), group.privK)
            }
            else             -> {
                throw DocumentNotFoundException("A Dummy User will be created in the Catch-Block!")
            }
        }
    } catch (ex: DbAccessException) {
        val user = encryptionLibrary.generateDummyUser(key.second)
        ResponseChallenge(encryptionLibrary.generateInternalAdministrationChallenge().getChallengeEncryptedByPubK(user.pubK), user.privK)
    }
}

