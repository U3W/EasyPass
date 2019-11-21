package dev.easypass.auth.customBeans

import dev.easypass.auth.data.AuthenticationRequest
import dev.easypass.auth.data.ChallengeForUserAuth
import dev.easypass.auth.data.UserRepository
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
class EPSecurityAuthenticationProvider(private val userRepository: UserRepository, private val epEncryptionLibrary: EPEncryptionLibrary) : AuthenticationProvider {
    private var currentChallenges = HashMap<String, ChallengeForUserAuth>()

    @Throws(AuthenticationException::class)
    override fun authenticate(authentication: Authentication): Authentication? {
        val uname = authentication.getName()
        val challenge = authentication.getCredentials().toString()
        val authorities = ArrayList<GrantedAuthority>()
        authorities.add(SimpleGrantedAuthority(uname))
        return if (currentChallenges[uname] != null && currentChallenges[uname]?.decryptedChallenge == challenge) {
            UsernamePasswordAuthenticationToken(uname, challenge, authorities)
        } else {
            null
        }
    }

    override fun supports(authentication: Class<*>): Boolean {
        return authentication == UsernamePasswordAuthenticationToken::class.java
    }

    fun addUserChallenge(uname: String): AuthenticationRequest {
        return try {
            currentChallenges[uname] = epEncryptionLibrary.generateAuthenticationChallenge()
            epEncryptionLibrary.generateAuthenticationForm(currentChallenges[uname]!!, userRepository.findOneByUname(uname))
        } catch (ex: DocumentNotFoundException) {
            println(ex.message)
            epEncryptionLibrary.generateAuthenticationForm(epEncryptionLibrary.generateAuthenticationChallenge(), epEncryptionLibrary.generateDummyUser(uname))
        }
    }
}