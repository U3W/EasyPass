package dev.easypass.auth.security

import dev.easypass.auth.datstore.CouchDBConnectionProvider
import dev.easypass.auth.datstore.document.User
import dev.easypass.auth.datstore.exception.EntityAlreadyinDatabaseException
import dev.easypass.auth.datstore.repository.UserRepository
import dev.easypass.auth.security.exception.NoActiveChallengeException
import dev.easypass.auth.security.exception.UserIsBlockedException
import dev.easypass.auth.security.challenge.InternalAuthenticationChallenge
import dev.easypass.auth.security.challenge.UserAuthenticationChallenge
import org.ektorp.DocumentNotFoundException
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.web.authentication.WebAuthenticationDetails
import org.springframework.stereotype.Component
import java.time.Duration
import java.time.LocalDateTime
import java.util.*
import kotlin.collections.HashMap


/**
 * Enables the authentication with challenges
 * @param userRepository: provides the required database support to administer [dev.easypass.auth.datstore.document.User] objects
 * @param encryptionLibrary: this class provides the required encryption methods
 */
@Component
class ChallengeAuthenticationProvider(private val userRepository: UserRepository, private val connector: CouchDBConnectionProvider, private val encryptionLibrary: EncryptionLibrary, private val properties: Properties) : AuthenticationProvider {
    private val currentChallenges = HashMap<Pair<String, String>, InternalAuthenticationChallenge>()
    private var attemptCounter = HashMap<Pair<String, String>, Pair<Int, LocalDateTime>>()

    /**
     * Checks if the user credentials are correct
     * @param authentication: the [Authentication] which contains the user credentials
     */
    @Throws(AuthenticationException::class)
    override fun authenticate(authentication: Authentication): Authentication? {
        val ip = (authentication.details as WebAuthenticationDetails).remoteAddress
        val uname = authentication.name
        val challenge = authentication.credentials.toString()
        val authorities = ArrayList<GrantedAuthority>()
        authorities.add(SimpleGrantedAuthority(uname))

        val key = Pair(ip, uname)

        if (currentChallenges[key] == null) {
            loginFailed(key)
            throw NoActiveChallengeException()
        }
        else if (!currentChallenges[key]!!.isActive()) {
            loginFailed(key)
            currentChallenges.remove(key)
            throw NoActiveChallengeException()
        }
        else if (isBlocked(key)) {
            throw UserIsBlockedException()
        }
        else if (!currentChallenges[key]!!.checkChallenge(challenge)){
            loginFailed(key)
            throw BadCredentialsException("Wrong credentials provided")
        } else {
            loginSucceeded(key)
            return UsernamePasswordAuthenticationToken(uname, challenge, authorities)
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
        if(attemptCounter[key] == null)
            attemptCounter[key] = Pair(1, LocalDateTime.now())
        else
            attemptCounter[key] = Pair(attemptCounter[key]!!.first+1, LocalDateTime.now())
    }

    fun isBlocked(key: Pair<String, String>): Boolean {
        if (attemptCounter[key] != null) {
            if (Duration.between(attemptCounter[key]!!.second, LocalDateTime.now()).toMillis()/1000 >= properties.getProperty("auth.secondsAfterAttemptsAreReset").toInt())
                attemptCounter.remove(key)
            else if (attemptCounter[key]!!.first > properties.getProperty("auth.allowedWrongAttemptsUntilBlock").toInt())
                return true
        }
        return false
    }

    /**
     * Adds a new [InternalAuthenticationChallenge] to the [currentChallenges]
     * @param uname: the name of the user
     */
    fun addUserChallenge(ip: String, uname: String): UserAuthenticationChallenge {
        val key = Pair(ip, uname)
        return try {
            currentChallenges[key] = encryptionLibrary.generateInternalAdministrationChallenge()
            val user = userRepository.findOneByUname(uname)
            UserAuthenticationChallenge(currentChallenges[key]!!.getChallengeEncryptedByPublicKey(user.publicKey), user.privateKey)
        } catch (ex: DocumentNotFoundException) {
            val user = encryptionLibrary.generateDummyUser(uname)
            UserAuthenticationChallenge(encryptionLibrary.generateInternalAdministrationChallenge().getChallengeEncryptedByPublicKey(user.publicKey), user.privateKey)
        }
    }

    fun registerUser(user: User): String {
        try {
            userRepository.add(user)
            connector.createCouchDbConnector(user.uname)
        } catch (ex: EntityAlreadyinDatabaseException) {
            return ex.message.toString()
        }
        return "UserAddedSuccessfully"
    }
}