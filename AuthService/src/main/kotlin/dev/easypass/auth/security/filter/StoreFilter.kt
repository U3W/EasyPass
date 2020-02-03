package dev.easypass.auth.security.filter

import org.springframework.security.core.authority.*
import org.springframework.security.core.context.*
import org.springframework.stereotype.*
import org.springframework.web.filter.*
import javax.servlet.*
import javax.servlet.http.*

@Component
class StoreFilter : OncePerRequestFilter() {
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

    override fun shouldNotFilter(request: HttpServletRequest): Boolean {
        val path = request.servletPath
        println("Store $path ${request.requestURL}")
        return !path.startsWith("/store/")
    }
}
