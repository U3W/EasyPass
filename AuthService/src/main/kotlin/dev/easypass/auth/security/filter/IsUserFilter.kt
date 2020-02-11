package dev.easypass.auth.security.filter

import org.springframework.security.core.authority.*
import org.springframework.security.core.context.*
import org.springframework.stereotype.*
import org.springframework.web.filter.*
import javax.servlet.*
import javax.servlet.http.*

/**
 * Checks each request and sends an UNAUTHORIZED 401 ERROR, if the authorities don't contain the String ROLE_USER
 */
@Component
class IsUserFilter : OncePerRequestFilter() {
    /**
     * Validates the authorities of the [request]
     * @param request: an instance of the class [HttpServletRequest]
     * @param response: an instance of the class [HttpServletResponse]
     * @param filterChain: to continue the filter chain after the authority was found
     */
    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, filterChain: FilterChain) {
        val authentication = SecurityContextHolder.getContext().authentication
        val authorities = AuthorityUtils.authorityListToSet(authentication.authorities)
        println("User $authorities ${request.requestURL}")
        if (!(authorities.contains("ROLE_USER")))
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "This task is only available for users.")
        else
            filterChain.doFilter(request, response)

    }

    /**
     * When the url doesn't contain "/admin/" the filter is not applied
     * @param request: an instance of the class [HttpServletRequest]
     */
    override fun shouldNotFilter(request: HttpServletRequest): Boolean {
        val path = request.servletPath
        println("User $path ${request.requestURL}")
        return !path.startsWith("/user/")
    }
}