package dev.easypass.auth.rest

import dev.easypass.auth.datstore.*
import dev.easypass.auth.datstore.document.*
import dev.easypass.auth.datstore.repository.*
import dev.easypass.auth.security.*
import dev.easypass.auth.security.challenge.*
import org.ektorp.*
import org.springframework.web.bind.annotation.*
import javax.servlet.http.*

/**
 * This [RestController] provides the Rest-Api for the user authentication
 */
@RestController
@RequestMapping("/auth")
class AuthRestController(private val challengeAuthenticationProvider: ChallengeAuthenticationProvider,
                         private val couchDBConnectionProvider: CouchDBConnectionProvider,
                         private val userRepository: UserRepository) {
    @PostMapping("/challenge")
    fun unlockChallenge(@RequestBody challenge: RequestChallenge, request: HttpServletRequest): ResponseChallenge {
        return challengeAuthenticationProvider.addUserChallenge(Pair(request.remoteAddr, challenge.hash), challenge.role)
    }

    /**
     * A request to this url tries to register a [User]
     */
    @PostMapping("/register")
    fun register(@RequestBody user: User, response: HttpServletResponse) = try {
        userRepository.add(user)
        couchDBConnectionProvider.createCouchDbConnector(user.uname)
        response.status = HttpServletResponse.SC_OK
    } catch (ex: DbAccessException) {
        response.sendError(HttpServletResponse.SC_FORBIDDEN, "${user.uname} was not registered!")
    }
}