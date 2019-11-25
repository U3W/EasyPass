package dev.easypass.auth.security

import dev.easypass.auth.security.challenge.UserAuthenticationChallenge
import org.springframework.web.bind.annotation.*
import javax.servlet.http.HttpServletResponse

/**
 * This [RestController] provides the Rest-Api for the user authentication
 */
@RestController
class RestAPIController(private val challengeAuthenticationProvider: ChallengeAuthenticationProvider) {

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
    @GetMapping("/unlockChallenge")
    @ResponseBody
    fun unlockChallenge(@RequestParam uname: String): UserAuthenticationChallenge {
        return challengeAuthenticationProvider.addUserChallenge(uname)
    }
}