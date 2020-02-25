package dev.easypass.auth.security.exception

import org.springframework.security.core.*

class NoActiveChallengeException(message: String = "There is no challenge currently running for this ip-address") : AuthenticationException(message)