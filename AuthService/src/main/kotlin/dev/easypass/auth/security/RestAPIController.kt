package dev.easypass.auth.security

import ch.qos.logback.core.net.SyslogOutputStream
import dev.easypass.auth.datstore.document.Group
import dev.easypass.auth.datstore.document.User
import dev.easypass.auth.security.challenge.RequestAuthenticationChallenge
import dev.easypass.auth.security.challenge.ResponseAuthenticationChallenge
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*
import javax.servlet.ServletOutputStream
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

/**
 * This [RestController] provides the Rest-Api for the user authentication
 */
@RestController
@RequestMapping("/auth")
class RestAPIController(private val challengeAuthenticationProvider: ChallengeAuthenticationProvider) {

    @PostMapping("/challenge")
    @ResponseBody
    fun unlockChallenge(@RequestBody challenge: RequestAuthenticationChallenge, request: HttpServletRequest): ResponseAuthenticationChallenge {
        return challengeAuthenticationProvider.addUserChallenge(Pair(request.remoteAddr, challenge.hash), challenge.role)
    }

    /**
     * A request to this url tries to register a [User]
     */
    @PostMapping("/register")
    @ResponseBody
    fun register(@RequestBody user: User, response: HttpServletResponse) {
        if (challengeAuthenticationProvider.registerUser(user))
            response.status = HttpServletResponse.SC_OK
        else
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User was not registered!")
    }

    @PostMapping("/group")
    @ResponseBody
    fun createGroup(@RequestBody group: Group, response: HttpServletResponse) {
        if (challengeAuthenticationProvider.createGroup(group))
            response.status = HttpServletResponse.SC_OK
        else
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Group was not created!")
    }
}