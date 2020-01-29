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
class AuthorityFilter(private val properties: Properties) : OncePerRequestFilter() {
    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, filterChain: FilterChain) {
        val url = request.requestURL.toString()
        val authorities = AuthorityUtils.authorityListToSet(SecurityContextHolder.getContext().authentication.authorities)
        val store = ":${properties.getProperty("server.port")}/store/"
        val admin = ":${properties.getProperty("server.port")}/admin/"
        println(url)
        if (authorities.isNotEmpty()) {
            when {
                url.contains(store) -> {
                    val hash = url.substringAfter(store).split("/")[0]
                    if (!authorities.contains("HASH_$hash"))
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized for this datastore!")
                }
                url.contains(admin) -> {
                    if (!(authorities.contains("ROLE_USER") or authorities.contains("ROLE_ADMIN")))
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Not an admin!")
                }
            }
            filterChain.doFilter(request, response)
        }
    }
}
