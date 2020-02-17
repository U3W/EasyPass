package dev.easypass.auth.rest

import dev.easypass.auth.datstore.*
import dev.easypass.auth.datstore.document.*
import dev.easypass.auth.datstore.repository.*
import dev.easypass.auth.security.*
import dev.easypass.auth.security.mapper.*
import org.ektorp.*
import org.springframework.web.bind.annotation.*
import javax.servlet.http.*

/**
 * This [RestController] provides the Rest-Api for the user authentication
 * @param challengeAuthenticationProvider: an instance of the class [ChallengeAuthenticationProvider]
 * @param couchDBConnectionProvider: an instance of the class [CouchDBConnectionProvider] to access the CouchDB-Datastore
 * @param userRepository: an instance of the class [UserRepository] to gain CRUD operations for [User]s
 */
@RestController
@RequestMapping("/auth")
class AuthRestController(private val challengeAuthenticationProvider: ChallengeAuthenticationProvider,
                         private val couchDBConnectionProvider: CouchDBConnectionProvider,
                         private val userRepository: UserRepository) {
    /**
     * A request creates a new challenge in the [ChallengeAuthenticationProvider]
     * @param challenge: an instance of the class [RequestChallenge] which specifies the challenge credentials
     * @param request: an instance of the class [HttpServletRequest]
     */
    @PostMapping("/challenge")
    fun unlockChallenge(@RequestBody challenge: RequestChallenge, request: HttpServletRequest): ResponseChallenge {
        return challengeAuthenticationProvider.addUserChallenge(Pair(request.remoteAddr, challenge.hash), challenge.role)
    }

    /**
     * A request registers a new user
     * The response code 200 is returned, if the user was registered
     * The response code 403 is returned, if something went wrong
     * @param user: an instance of the class [User] which specifies the user credentials
     * @param response: an instance of the class [HttpServletResponse]
     */
    @PostMapping("/register")
    fun register(@RequestBody user: User, response: HttpServletResponse) = try {
        userRepository.add(user)
        couchDBConnectionProvider.createCouchDbConnector("${user.uid}-m")
        couchDBConnectionProvider.createCouchDbConnector("${user.uid}-p")
        couchDBConnectionProvider.createCouchDbConnector("${user.uid}-g")
        response.status = HttpServletResponse.SC_OK
    } catch (ex: DbAccessException) {
        response.sendError(HttpServletResponse.SC_FORBIDDEN, "${user.uid} was not registered!")
    }
}