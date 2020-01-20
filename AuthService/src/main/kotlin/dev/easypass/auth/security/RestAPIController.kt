package dev.easypass.auth.security

import dev.easypass.auth.datstore.document.User
import dev.easypass.auth.security.challenge.RequestAuthenticationChallenge
import dev.easypass.auth.security.challenge.ResponseAuthenticationChallenge
import org.springframework.web.bind.annotation.*
import java.util.*
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

/**
 * This [RestController] provides the Rest-Api for the user authentication
 */
@RestController
@RequestMapping("/auth")
class RestAPIController(private val challengeAuthenticationProvider: ChallengeAuthenticationProvider, private val properties: Properties) {

    /**
     * A simple redirect to the project website
     * @param response: is used to send the redirect
     */
    @GetMapping("/")
    fun index(response: HttpServletResponse) {
        response.sendRedirect("https://easypass.dev/")
    }

    /**
     * A request to this url creates a challenge for the user
     * @param uname: the name of the [dev.easypass.auth.datstore.document.User]
     */
    @PostMapping("/challenge")
    @ResponseBody
    fun unlockChallenge(request: HttpServletRequest, @RequestBody challenge: RequestAuthenticationChallenge): ResponseAuthenticationChallenge {
        return challengeAuthenticationProvider.addUserChallenge(Pair(request.remoteAddr, challenge.uname), challenge.role)
    }

    /**
     * A request to this url tries to register a [User]
     */
    @PostMapping("/register")
    @ResponseBody
    fun register(@RequestBody user: User): String {
        return challengeAuthenticationProvider.registerUser(user)
    }
}