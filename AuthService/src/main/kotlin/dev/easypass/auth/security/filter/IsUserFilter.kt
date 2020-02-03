package dev.easypass.auth.security.filter

import org.springframework.security.core.authority.*
import org.springframework.security.core.context.*
import org.springframework.stereotype.*
import org.springframework.web.filter.*
import javax.servlet.*
import javax.servlet.http.*

@Component
class IsUserFilter : OncePerRequestFilter() {
    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, filterChain: FilterChain) {
        val authentication = SecurityContextHolder.getContext().authentication
        val authorities = AuthorityUtils.authorityListToSet(authentication.authorities)
        println("User $authorities ${request.requestURL}")
        if (!(authorities.contains("ROLE_USER")))
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "This task is only available for users.")
        else
            filterChain.doFilter(request, response)

    }

    override fun shouldNotFilter(request: HttpServletRequest): Boolean {
        val path = request.servletPath
        println("User $path ${request.requestURL}")
        return !path.startsWith("/user/")
    }
}