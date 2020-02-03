package dev.easypass.auth.security.filter

import org.springframework.security.core.authority.AuthorityUtils
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.util.*
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@Component
class StoreFilter(private val properties: Properties) : OncePerRequestFilter() {
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
