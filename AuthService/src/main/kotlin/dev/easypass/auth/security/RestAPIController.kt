package dev.easypass.auth.security

import dev.easypass.auth.datstore.CouchDBConnectionProvider
import dev.easypass.auth.datstore.document.User
import dev.easypass.auth.datstore.exception.EntityAlreadyinDatabaseException
import dev.easypass.auth.datstore.repository.UserRepository
import dev.easypass.auth.security.challenge.UserAuthenticationChallenge
import org.springframework.web.bind.annotation.*
import javax.servlet.http.HttpServletResponse

/**
 * This [RestController] provides the Rest-Api for the user authentication
 */
@RestController
class RestAPIController(private val challengeAuthenticationProvider: ChallengeAuthenticationProvider, private val userRepository: UserRepository, private val connector: CouchDBConnectionProvider) {

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
    @PostMapping("/auth/challenge")
    @ResponseBody
    fun unlockChallenge(@RequestParam uname: String): UserAuthenticationChallenge {
        return challengeAuthenticationProvider.addUserChallenge(uname)
    }

    /**
     * A request to this url tries to register a [User]
     */
    @PostMapping("/auth/register")
    @ResponseBody
    fun register(@RequestBody user: User): String {
        try {
            userRepository.add(user)
            connector.createCouchDbConnector(user.uname)
        } catch (ex: EntityAlreadyinDatabaseException) {
            return ex.message.toString()
        }
        return "UserAddedSuccessfully"
    }
}