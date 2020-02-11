package dev.easypass.auth.security.filter

import org.springframework.security.core.authority.*
import org.springframework.security.core.context.*
import org.springframework.stereotype.*
import org.springframework.web.filter.*
import javax.servlet.*
import javax.servlet.http.*

/**
 * Checks each request and sends an UNAUTHORIZED 401 ERROR, if the authorities don't contain the hash of the username of the current request
 */
@Component
class StoreFilter : OncePerRequestFilter() {
    /**
     * Validates the authorities of the [request]
     * @param request: an instance of the class [HttpServletRequest]
     * @param response: an instance of the class [HttpServletResponse]
     * @param filterChain: to continue the filter chain after the authority was found
     */
    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, filterChain: FilterChain) {
        val authentication = SecurityContextHolder.getContext().authentication
        val authorities = AuthorityUtils.authorityListToSet(authentication.authorities)
        println("Store $authorities ${request.requestURL}")
        val hash = request.servletPath.substringAfter("/store/").split("/")[0]
        if (!authorities.contains("HASH_$hash"))
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized for this datastore!")
        else
            filterChain.doFilter(request, response)
    }

    /**
     * When the url doesn't contain "/admin/" the filter is not applied
     * @param request: an instance of the class [HttpServletRequest]
     */
    override fun shouldNotFilter(request: HttpServletRequest): Boolean {
        val path = request.servletPath
        println("Store $path ${request.requestURL}")
        return !path.startsWith("/store/")
    }
}
