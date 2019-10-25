package Easypass.SecurityProtoType

import dev.easypass.auth.repositories.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import java.util.ArrayList
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.GrantedAuthority
import org.springframework.stereotype.Component


@Component
class EPAuthenticationProvider : AuthenticationProvider {

    @Autowired
    private val userRepository:  UserRepository?= null

    @Throws(AuthenticationException::class)
    override fun authenticate(authentication: Authentication): Authentication? {

        val name = authentication.getName()

        return if (checkAuthentication(authentication)) {
            UsernamePasswordAuthenticationToken(
                    name, ArrayList<GrantedAuthority>())
        } else {
            null
        }
    }

    override fun supports(authentication: Class<*>): Boolean {
        return authentication == UsernamePasswordAuthenticationToken::class.java
    }

    fun checkAuthentication(authentication: Authentication): Boolean {
        return true
    }
}