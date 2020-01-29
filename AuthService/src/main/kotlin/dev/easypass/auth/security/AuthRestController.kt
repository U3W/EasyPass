package dev.easypass.auth.security

import dev.easypass.auth.datstore.document.Group
import dev.easypass.auth.datstore.document.User
import dev.easypass.auth.security.challenge.RequestChallenge
import dev.easypass.auth.security.challenge.ResponseChallenge
import org.springframework.web.bind.annotation.*
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

/**
 * This [RestController] provides the Rest-Api for the user authentication
 */
@RestController
@RequestMapping("/auth")
class AuthRestController(private val challengeAuthenticationProvider: ChallengeAuthenticationProvider) {

    @PostMapping("/challenge")
    @ResponseBody
    fun unlockChallenge(@RequestBody challenge: RequestChallenge, request: HttpServletRequest): ResponseChallenge {
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