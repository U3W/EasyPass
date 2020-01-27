package dev.easypass.auth.security.filter

import org.springframework.security.core.authority.AuthorityUtils
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.access.intercept.FilterSecurityInterceptor
import org.springframework.security.web.authentication.WebAuthenticationDetails
import org.springframework.security.web.util.matcher.RequestMatcher
import org.springframework.stereotype.Component
import org.springframework.stereotype.Service
import org.springframework.web.filter.GenericFilterBean
import org.springframework.web.filter.OncePerRequestFilter
import java.util.*
import javax.servlet.FilterChain
import javax.servlet.ServletRequest
import javax.servlet.ServletResponse
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@Component
class AdminAuthorityFilter(private val properties: Properties): OncePerRequestFilter() {
    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, filterChain: FilterChain) {
        val url = request.requestURL.toString()
        val authorities = AuthorityUtils.authorityListToSet(SecurityContextHolder.getContext().authentication.authorities)
        val store = ":${properties.getProperty("server.port")}/admin/"
        val hash = url.substringAfter(store).split("/")[0]
        if (url.contains(store) and authorities.isNotEmpty()) {
            if (!(authorities.contains("USER_$hash") or authorities.contains("GROUP_$hash") or authorities.contains("ADMIN_$hash")))
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized for this datastore!")
        }
        filterChain.doFilter(request, response)
    }
}
