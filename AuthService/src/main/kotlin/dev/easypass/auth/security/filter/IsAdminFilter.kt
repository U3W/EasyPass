package dev.easypass.auth.security.filter

import org.springframework.security.core.authority.*
import org.springframework.security.core.context.*
import org.springframework.stereotype.*
import org.springframework.web.filter.*
import javax.servlet.*
import javax.servlet.http.*

@Component
class IsAdminFilter : OncePerRequestFilter() {
    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, filterChain: FilterChain) {
        val authentication = SecurityContextHolder.getContext().authentication
        val authorities = AuthorityUtils.authorityListToSet(authentication.authorities)
        println("Admin $authorities ${request.requestURL}")
        if (!(authorities.contains("ROLE_ADMIN")))
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "This task is only available for admins.")
        else
            filterChain.doFilter(request, response)

    }

    override fun shouldNotFilter(request: HttpServletRequest): Boolean {
        val path = request.servletPath
        println("Admin $path ${request.requestURL}")
        return !path.startsWith("/admin/")
    }
}