package dev.easypass.auth.security.exception

import org.springframework.security.core.*

/**
 * This Exception is thrown if the unique identifier of an object is already saved in the database
 * @param message: is printed by the exception
 */
class UserIsBlockedException(message: String = "This user is blocked") : AuthenticationException(message)