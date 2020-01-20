package dev.easypass.auth.security

import dev.easypass.auth.datstore.CouchDBConnectionProvider
import dev.easypass.auth.datstore.document.User
import dev.easypass.auth.datstore.exception.EntityAlreadyinDatabaseException
import dev.easypass.auth.datstore.repository.UserRepository
import dev.easypass.auth.security.challenge.UserAuthenticationChallenge
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpEntity
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

    private val authContextPath = properties.getProperty("auth.context-path")

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
    fun unlockChallenge(request: HttpServletRequest, @RequestBody user: User): UserAuthenticationChallenge {
        return challengeAuthenticationProvider.addUserChallenge(request.remoteAddr, user.uname)
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