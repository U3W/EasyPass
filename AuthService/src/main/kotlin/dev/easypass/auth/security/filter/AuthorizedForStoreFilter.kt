package dev.easypass.auth.security.filter

import org.springframework.security.core.authority.AuthorityUtils
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.WebAuthenticationDetails
import org.springframework.security.web.util.matcher.RequestMatcher
import org.springframework.stereotype.Component
import org.springframework.stereotype.Service
import org.springframework.web.filter.GenericFilterBean
import java.util.*
import javax.servlet.FilterChain
import javax.servlet.ServletRequest
import javax.servlet.ServletResponse
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@Component
class AuthorizedForStoreFilter(private val properties: Properties): GenericFilterBean() {
    override fun doFilter(request: ServletRequest?, response: ServletResponse?, chain: FilterChain?) {
        val url = (request as HttpServletRequest).requestURL.toString()
        val authorities = AuthorityUtils.authorityListToSet(SecurityContextHolder.getContext().authentication.authorities)
        val store = ":${properties.getProperty("server.port")}/store/"
        if (url.contains(store)){
            val uname = url.substringAfter(store).split("/")[0]
            (response as HttpServletResponse).sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized")
        }
        chain?.doFilter(request, response)
    }
}
