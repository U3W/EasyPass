package dev.easypass.auth.security.exception

import org.springframework.security.core.*

/**
 * This Exception is thrown if the unique identifier of an object is already saved in the database
 * @param message: is printed by the exception
 */
class NoActiveChallengeException(message: String = "There is no challenge currently running for this ip-address") : AuthenticationException(message)