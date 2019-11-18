package dev.easypass.auth

import dev.easypass.auth.repositories.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import java.util.ArrayList
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.GrantedAuthority
import org.springframework.stereotype.Component
import org.springframework.stereotype.Service

@Component
class EPAuthenticationProvider : AuthenticationProvider {

    @Autowired
    private val userRepository:  UserRepository?= null

    @Throws(AuthenticationException::class)
    override fun authenticate(authentication: Authentication): Authentication? {

        val name = authentication.getName()
        val password = authentication.getCredentials().toString()

        return if (checkAuthentication(authentication)) {
            UsernamePasswordAuthenticationToken(
                    name, password, ArrayList<GrantedAuthority>())
        } else {
            null
        }
    }

    override fun supports(authentication: Class<*>): Boolean {
        return authentication == UsernamePasswordAuthenticationToken::class.java
    }

    fun checkAuthentication(authentication: Authentication): Boolean {
        return false
    }
}