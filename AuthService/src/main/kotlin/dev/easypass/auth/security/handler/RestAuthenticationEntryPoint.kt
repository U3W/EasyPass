package dev.easypass.auth.security.handler

import org.springframework.security.core.*
import org.springframework.security.web.*
import java.io.*
import javax.servlet.http.*


class RestAuthenticationEntryPoint : AuthenticationEntryPoint {
    @Throws(IOException::class)
    override fun commence(request: HttpServletRequest?, response: HttpServletResponse, authException: AuthenticationException?) {
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized")
    }
}