package dev.easypass.auth.security.handler

import org.springframework.security.core.*
import org.springframework.security.web.authentication.*
import org.springframework.security.web.savedrequest.*
import org.springframework.util.*
import java.io.*
import javax.servlet.*
import javax.servlet.http.*


class RestAuthenticationSuccessHandler : SimpleUrlAuthenticationSuccessHandler() {
    private var requestCache: RequestCache = HttpSessionRequestCache()

    @Throws(ServletException::class, IOException::class)
    override fun onAuthenticationSuccess(
            request: HttpServletRequest,
            response: HttpServletResponse?,
            authentication: Authentication?) {
        val savedRequest: SavedRequest? = requestCache.getRequest(request, response)
        if (savedRequest == null) {
            clearAuthenticationAttributes(request)
            return
        }
        val targetUrlParam = targetUrlParameter
        if (isAlwaysUseDefaultTargetUrl
                || (targetUrlParam != null
                        && StringUtils.hasText(request.getParameter(targetUrlParam)))) {
            requestCache.removeRequest(request, response)
            clearAuthenticationAttributes(request)
            return
        }
        clearAuthenticationAttributes(request)
    }
}