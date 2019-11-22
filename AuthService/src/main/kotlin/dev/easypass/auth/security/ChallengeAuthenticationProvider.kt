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

@Component
class ChallengeAuthenticationProvider(private val userRepository: UserRepository, private val encryptionLibrary: EncryptionLibrary) : AuthenticationProvider {
    private var currentChallenges = HashMap<String, InternalAdministrationChallenge>()

    @Throws(AuthenticationException::class)
    override fun authenticate(authentication: Authentication): Authentication? {
        val uname = authentication.getName()
        val challenge = authentication.getCredentials().toString()
        val authorities = ArrayList<GrantedAuthority>()
        authorities.add(SimpleGrantedAuthority(uname))
        println(uname)
        println(challenge)
        println(authorities)
        return if (currentChallenges[uname] != null && currentChallenges[uname]!!.checkChallenge(challenge)) {
            currentChallenges.remove(uname)
            UsernamePasswordAuthenticationToken(uname, challenge, authorities)
        } else {
            null
        }
    }

    override fun supports(authentication: Class<*>): Boolean {
        return authentication == UsernamePasswordAuthenticationToken::class.java
    }

    fun addUserChallenge(uname: String): UserAuthenticationChallenge {
        return try {
            currentChallenges[uname] = encryptionLibrary.getObjOfChallengeDataForInternalAdministration()
            UserAuthenticationChallenge(currentChallenges[uname]!!.getChallengeEncryptedByPublicKey(userRepository.findOneByUname(uname).publicKey), uname)
        } catch (ex: DocumentNotFoundException) {
            UserAuthenticationChallenge(encryptionLibrary.getObjOfChallengeDataForInternalAdministration().getChallengeEncryptedByPublicKey(encryptionLibrary.generateDummyUser(uname).publicKey), uname)
        }
    }
}