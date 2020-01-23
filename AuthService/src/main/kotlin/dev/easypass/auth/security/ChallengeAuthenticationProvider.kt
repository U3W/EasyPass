package dev.easypass.auth.security

import dev.easypass.auth.datstore.CouchDBConnectionProvider
import dev.easypass.auth.datstore.document.User
import dev.easypass.auth.datstore.exception.EntityAlreadyinDatabaseException
import dev.easypass.auth.datstore.repository.GroupRepository
import dev.easypass.auth.datstore.repository.UserRepository
import dev.easypass.auth.security.challenge.InternalAuthenticationChallenge
import dev.easypass.auth.security.challenge.ResponseAuthenticationChallenge
import dev.easypass.auth.security.exception.NoActiveChallengeException
import dev.easypass.auth.security.exception.UserIsBlockedException
import org.ektorp.DocumentNotFoundException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
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
class ChallengeAuthenticationProvider(private val userRepository: UserRepository, private val groupRepository: GroupRepository, private val connector: CouchDBConnectionProvider, private val encryptionLibrary: EncryptionLibrary, private val properties: Properties) : AuthenticationProvider {
    private val currentChallenges = HashMap<Pair<String, String>, Pair<InternalAuthenticationChallenge, String>>()
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
        } else if (!currentChallenges[key]!!.first.checkChallenge(pwd)){
            loginFailed(key)
            throw BadCredentialsException("Wrong credentials provided")
        } else {
            val authorities = ArrayList<GrantedAuthority>()
            authorities.add(SimpleGrantedAuthority(currentChallenges[key]!!.second+"_"+key.second))
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
    fun addUserChallenge(key: Pair<String, String>, role: String): ResponseAuthenticationChallenge = try {
        if (currentChallenges.keys.contains(key)) {
            if (currentChallenges[key]!!.first.isActive())
                throw DocumentNotFoundException("A Dummy User will be created in the Catch-Block!")
            else
                currentChallenges.remove(key)
        }
        when (role) {
            "USER" -> {
                val user = userRepository.findOneByUname(key.second)
                currentChallenges[key] = Pair(encryptionLibrary.generateInternalAdministrationChallenge(), role)
                ResponseAuthenticationChallenge(currentChallenges[key]!!.first.getChallengeEncryptedByPubK(user.pubK), user.privK)
            }
            "GROUP" -> {
                val group = groupRepository.findOneByGname(key.second)
                currentChallenges[key] = Pair(encryptionLibrary.generateInternalAdministrationChallenge(), role)
                ResponseAuthenticationChallenge(currentChallenges[key]!!.first.getChallengeEncryptedByPubK(group.pubK), group.privK)
            }
            "ADMIN" -> {
                val group = groupRepository.findOneByGname(key.second)
                currentChallenges[key] = Pair(encryptionLibrary.generateInternalAdministrationChallenge(), role)
                ResponseAuthenticationChallenge(currentChallenges[key]!!.first.getChallengeEncryptedByPubK(group.apubK), group.aprivK)
            }
            else -> {
                throw DocumentNotFoundException("A Dummy User will be created in the Catch-Block!")
            }
        }
    } catch (ex: DocumentNotFoundException) {
        val user = encryptionLibrary.generateDummyUser(key.second)
        ResponseAuthenticationChallenge(encryptionLibrary.generateInternalAdministrationChallenge().getChallengeEncryptedByPubK(user.pubK), user.privK)
    }

    fun registerUser(user: User): ResponseEntity<String> {
        try {
            userRepository.add(user)
            connector.createCouchDbConnector(user.uname)
        } catch (ex: EntityAlreadyinDatabaseException) {
            return ResponseEntity("Unauthorized", HttpStatus.UNAUTHORIZED)
        }
        return ResponseEntity("Ok", HttpStatus.OK)
    }
}