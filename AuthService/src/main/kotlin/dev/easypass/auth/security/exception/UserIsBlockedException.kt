package dev.easypass.auth.security.exception

import org.springframework.security.core.*

class UserIsBlockedException(message: String = "This user is blocked") : AuthenticationException(message)