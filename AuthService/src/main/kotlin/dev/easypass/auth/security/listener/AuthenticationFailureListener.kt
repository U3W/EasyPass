package dev.easypass.auth.security.listener

import dev.easypass.auth.security.ChallengeAuthenticationProvider
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.ApplicationListener
import org.springframework.security.authentication.event.AuthenticationFailureBadCredentialsEvent
import org.springframework.security.web.authentication.WebAuthenticationDetails
import org.springframework.stereotype.Component

@Component
class AuthenticationFailureListener(private val authProvider: ChallengeAuthenticationProvider): ApplicationListener<AuthenticationFailureBadCredentialsEvent> {
    override fun onApplicationEvent(e: AuthenticationFailureBadCredentialsEvent) {
        val auth = e.authentication.details as WebAuthenticationDetails
        authProvider.loginFailed(auth.remoteAddress)
    }
}