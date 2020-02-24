package dev.easypass.auth.security.filter

import org.springframework.security.core.*
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
        if (authentication == null)
            response.status = HttpServletResponse.SC_UNAUTHORIZED
        else {
            if (getHashes(authentication).contains(request.servletPath.substringAfter("/store/").substringBefore("/").substringBefore("-")))
                filterChain.doFilter(request, response)
            else
                response.status = HttpServletResponse.SC_FORBIDDEN
        }
    }

    override fun shouldNotFilter(request: HttpServletRequest): Boolean {
        val path = request.servletPath
        return !path.startsWith("/store/")
    }

    fun getHashes(authentication: Authentication): ArrayList<String> {
        val hashes = ArrayList<String>()
        for (authority in AuthorityUtils.authorityListToSet(authentication.authorities)) {
            hashes.add(authority.toString().substringAfter("USER_", ""))
            hashes.add(authority.toString().substringAfter("GROUP_", ""))
            hashes.add(authority.toString().substringAfter("ADMIN_", ""))
        }
        return hashes
    }
}
