package dev.easypass.auth.security.filter

import org.springframework.security.core.*
import org.springframework.security.core.authority.*
import org.springframework.security.core.context.*
import org.springframework.stereotype.*
import org.springframework.web.filter.*
import javax.servlet.*
import javax.servlet.http.*

/**
 * Checks each request and sends an UNAUTHORIZED 401 ERROR, if the authorities don't contain the String ROLE_ADMIN
 */
@Component
class IsGroupFilter : OncePerRequestFilter() {
    /**
     * Validates the authorities of the [request]
     * @param request: an instance of the class [HttpServletRequest]
     * @param response: an instance of the class [HttpServletResponse]
     * @param filterChain: to continue the filter chain after the authority was found
     */
    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, filterChain: FilterChain) {
        val authentication = SecurityContextHolder.getContext().authentication
        if (authentication == null)
            response.status = HttpServletResponse.SC_UNAUTHORIZED
        else {
            if (getGroupAndAdminHashes(authentication).contains(request.servletPath.substringAfter("/admin/").substringBefore("/")))
                filterChain.doFilter(request, response)
            else
                response.status = HttpServletResponse.SC_FORBIDDEN
        }
    }

    /**
     * When the url doesn't contain "/admin/" the filter is not applied
     * @param request: an instance of the class [HttpServletRequest]
     */
    override fun shouldNotFilter(request: HttpServletRequest): Boolean {
        val path = request.servletPath
        return !path.startsWith("/group/")
    }

    fun getGroupAndAdminHashes(authentication: Authentication): ArrayList<String> {
        val hashes = ArrayList<String>()
        for (authority in AuthorityUtils.authorityListToSet(authentication.authorities)) {
            hashes.add(authority.toString().substringAfter("GROUP_", ""))
            hashes.add(authority.toString().substringAfter("ADMIN_", ""))
        }
        println(hashes)
        return hashes
    }
}