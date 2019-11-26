package dev.easypass.auth.security.listener

import dev.easypass.auth.security.ChallengeAuthenticationProvider
import org.springframework.context.ApplicationListener
import org.springframework.security.authentication.event.AuthenticationSuccessEvent
import org.springframework.security.web.authentication.WebAuthenticationDetails
import org.springframework.stereotype.Component

@Component
class AuthenticationSuccessEventListener(private val authProvider: ChallengeAuthenticationProvider): ApplicationListener<AuthenticationSuccessEvent> {

    override fun onApplicationEvent(e: AuthenticationSuccessEvent) {
        val auth = e.authentication.details as WebAuthenticationDetails
        authProvider.loginSucceeded(auth.remoteAddress)
    }
}