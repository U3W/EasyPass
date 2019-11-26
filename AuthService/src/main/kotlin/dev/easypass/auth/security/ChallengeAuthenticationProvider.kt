package dev.easypass.auth.security

import dev.easypass.auth.datstore.repository.UserRepository
import dev.easypass.auth.security.challenge.InternalAdministrationChallenge
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
import java.util.*
import kotlin.collections.HashMap


/**
 * Enables the authentication with challenges
 * @param userRepository: provides the required database support to administer [dev.easypass.auth.datstore.document.User] objects
 * @param encryptionLibrary: this class provides the required encryption methods
 */
@Component
class ChallengeAuthenticationProvider(private val userRepository: UserRepository, private val encryptionLibrary: EncryptionLibrary, private val properties: Properties) : AuthenticationProvider {
    private val currentChallenges = HashMap<String, InternalAdministrationChallenge>()

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
        if (currentChallenges[ip] != null) {
            if (currentChallenges[ip]!!.checkChallenge(challenge)) {
                currentChallenges.remove(ip)
                return UsernamePasswordAuthenticationToken(uname, challenge, authorities)
            } else
                throw BadCredentialsException("Wrong credentials provided ")
        } else
            throw BadCredentialsException("There is no active challenge for this user!")
    }

    /**
     * Checks if the given token is supported by the application
     * @param authentication: the token-object to be verified
     */
    override fun supports(authentication: Class<*>): Boolean {
        return authentication == UsernamePasswordAuthenticationToken::class.java
    }

    fun loginSucceeded(ip: String) {
        println("$ip successfully loged in")
    }

    fun loginFailed(ip: String) {
        println("$ip login failed")
    }

    /**
     * Adds a new [InternalAdministrationChallenge] to the [currentChallenges]
     * @param uname: the name of the user
     */
    fun addUserChallenge(ip: String, uname: String): UserAuthenticationChallenge {
        return try {
            currentChallenges[ip] = encryptionLibrary.generateInternalAdministrationChallenge()
            val user = userRepository.findOneByUname(uname)
            UserAuthenticationChallenge(currentChallenges[ip]!!.getChallengeEncryptedByPublicKey(user.publicKey), user.privateKey)
        } catch (ex: DocumentNotFoundException) {
            val user = encryptionLibrary.generateDummyUser(uname)
            UserAuthenticationChallenge(encryptionLibrary.generateInternalAdministrationChallenge().getChallengeEncryptedByPublicKey(user.publicKey), user.privateKey)
        }
    }
}