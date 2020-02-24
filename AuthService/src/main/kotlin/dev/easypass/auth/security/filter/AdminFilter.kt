package dev.easypass.auth.security.filter

import org.springframework.security.core.*
import org.springframework.security.core.authority.*
import org.springframework.security.core.context.*
import org.springframework.stereotype.*
import org.springframework.web.filter.*
import javax.servlet.*
import javax.servlet.http.*

@Component
class AdminFilter : OncePerRequestFilter() {
    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, filterChain: FilterChain) {
        val authentication = SecurityContextHolder.getContext().authentication
        if (authentication == null)
            response.status = HttpServletResponse.SC_UNAUTHORIZED
        else {
            if (getAdminHashes(authentication).contains(request.servletPath.substringAfter("/admin/").substringBefore("/")))
                filterChain.doFilter(request, response)
            else
                response.status = HttpServletResponse.SC_FORBIDDEN
        }
    }

    override fun shouldNotFilter(request: HttpServletRequest): Boolean {
        val path = request.servletPath
        return !path.startsWith("/admin/")
    }

    fun getAdminHashes(authentication: Authentication): ArrayList<String> {
        val hashes = ArrayList<String>()
        for (authority in AuthorityUtils.authorityListToSet(authentication.authorities))
            hashes.add(authority.toString().substringAfter("ADMIN_", ""))
        return hashes
    }
}