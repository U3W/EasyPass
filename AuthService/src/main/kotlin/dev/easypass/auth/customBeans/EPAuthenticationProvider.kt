package dev.easypass.auth.customBeans

import dev.easypass.auth.data.UserRepository
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import java.util.ArrayList
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.GrantedAuthority
import org.springframework.stereotype.Component

@Component
class EPAuthenticationProvider(private val userRepository: UserRepository) : AuthenticationProvider {

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