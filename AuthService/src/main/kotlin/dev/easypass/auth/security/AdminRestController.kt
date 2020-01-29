package dev.easypass.auth.security

import dev.easypass.auth.security.challenge.RequestChallenge
import dev.easypass.auth.security.challenge.ResponseChallenge
import org.springframework.web.bind.annotation.*
import javax.servlet.http.HttpServletRequest

/**
 * This [RestController] provides the Rest-Api for the user authentication
 */
@RestController
@RequestMapping("/admin")
class AdminRestController(private val challengeAuthenticationProvider: ChallengeAuthenticationProvider) {

    @PostMapping("/challenge")
    @ResponseBody
    fun unlockChallenge(@RequestBody challenge: RequestChallenge, request: HttpServletRequest): ResponseChallenge {
        return challengeAuthenticationProvider.addUserChallenge(Pair(request.remoteAddr, challenge.hash), challenge.role)
    }
}