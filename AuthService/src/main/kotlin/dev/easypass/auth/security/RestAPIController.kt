package dev.easypass.auth.security

import dev.easypass.auth.security.challenge.UserAuthenticationChallenge
import org.springframework.web.bind.annotation.*
import javax.servlet.http.HttpServletResponse


@RestController
class RestAPIController(private val challengeAuthenticationProvider: ChallengeAuthenticationProvider) {

    @GetMapping("/web")
    fun index(response: HttpServletResponse) {
        response.sendRedirect("https://easypass.dev/")
    }

    @GetMapping("/unlockChallenge")
    @ResponseBody
    fun unlockChallenge(@RequestParam uname: String): UserAuthenticationChallenge {
        return challengeAuthenticationProvider.addUserChallenge(uname)
    }
}