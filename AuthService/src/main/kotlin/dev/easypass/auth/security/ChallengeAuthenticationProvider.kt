package dev.easypass.auth.security

import dev.easypass.auth.security.challenge.UserAuthenticationChallenge
import dev.easypass.auth.security.challenge.InternalAdministrationChallenge
import dev.easypass.auth.datstore.repository.UserRepository
import org.ektorp.DocumentNotFoundException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import java.util.ArrayList
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.stereotype.Component

/**
 * Enables the authentication with challenges
 * @param userRepository: provides the required database support to administer [dev.easypass.auth.datstore.document.User] objects
 * @param encryptionLibrary: this class provides the required encryption methods
 */
@Component
class ChallengeAuthenticationProvider(private val userRepository: UserRepository, private val encryptionLibrary: EncryptionLibrary) : AuthenticationProvider {
    private var currentChallenges = HashMap<String, InternalAdministrationChallenge>()

    /**
     * Checks if the user credentials are correct
     * @param authentication: the [Authentication] which contains the user credentials
     */
    @Throws(AuthenticationException::class)
    override fun authenticate(authentication: Authentication): Authentication? {
        val uname = authentication.getName()
        val challenge = authentication.getCredentials().toString()
        val authorities = ArrayList<GrantedAuthority>()
        authorities.add(SimpleGrantedAuthority(uname))
        return if (currentChallenges[uname] != null && currentChallenges[uname]!!.checkChallenge(challenge)) {
            currentChallenges.remove(uname)
            UsernamePasswordAuthenticationToken(uname, challenge, authorities)
        } else {
            null
        }
    }

    /**
     * Checks if the given token is supported by the application
     * @param authentication: the token-object to be verified
     */
    override fun supports(authentication: Class<*>): Boolean {
        return authentication == UsernamePasswordAuthenticationToken::class.java
    }

    /**
     * Adds a new [InternalAdministrationChallenge] to the [currentChallenges]
     * @param uname: the name of the user
     */
    fun addUserChallenge(uname: String): UserAuthenticationChallenge {
        return try {
            currentChallenges[uname] = encryptionLibrary.generateInternalAdministrationChallenge()
            val user = userRepository.findOneByUname(uname)
            UserAuthenticationChallenge(currentChallenges[uname]!!.getChallengeEncryptedByPublicKey(user.publicKey), user.privateKey)
        } catch (ex: DocumentNotFoundException) {
            val user = encryptionLibrary.generateDummyUser(uname)
            UserAuthenticationChallenge(encryptionLibrary.generateInternalAdministrationChallenge().getChallengeEncryptedByPublicKey(user.publicKey), user.privateKey)
        }
    }
}