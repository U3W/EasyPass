package dev.easypass.auth.security.filter

import org.springframework.security.core.authority.AuthorityUtils
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.filter.GenericFilterBean
import javax.servlet.FilterChain
import javax.servlet.ServletRequest
import javax.servlet.ServletResponse
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

class CouchDBAccessUsernameFilter: GenericFilterBean() {
    override fun doFilter(request: ServletRequest?, response: ServletResponse?, chain: FilterChain?) {
        val url = (request as HttpServletRequest).requestURL.toString()
        val authorities = AuthorityUtils.authorityListToSet(SecurityContextHolder.getContext().authentication.authorities)
        if (url.contains("/couchdb/")){
            if(!authorities.contains(url.substringAfterLast("couchdb/").split("/")[0])) {
                (response as HttpServletResponse).sendError(HttpServletResponse.SC_FORBIDDEN, "Unauthorized database access.")
            }
        }
        chain?.doFilter(request, response)
    }
}
