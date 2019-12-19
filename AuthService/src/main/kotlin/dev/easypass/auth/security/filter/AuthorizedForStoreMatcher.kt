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
class AuthorizedForStoreMatcher: RequestMatcher {
    override fun matches(request: HttpServletRequest?): Boolean {
        val url = (request as HttpServletRequest).requestURL.toString()
        val ip = (SecurityContextHolder.getContext().authentication.details as WebAuthenticationDetails).remoteAddress
        val authorities = AuthorityUtils.authorityListToSet(SecurityContextHolder.getContext().authentication.authorities)
        print(url)
        print(ip)
        print(authorities)
        return true
    }
}
