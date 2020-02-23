package dev.easypass.auth.rest

import dev.easypass.auth.datstore.*
import dev.easypass.auth.datstore.document.*
import dev.easypass.auth.datstore.repository.*
import dev.easypass.auth.security.*
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
     * @param request: an instance of the class [HttpServletRequest]
     */
    @PostMapping("/challenge")
    fun unlockChallenge(@RequestBody data: Map<String, String>, request: HttpServletRequest, response: HttpServletResponse): Map<String, Any> = try {
        val uid = data["uid"]!!
        val role = data["role"]!!
        challengeAuthenticationProvider.addChallenge(Pair(request.remoteAddr, uid), role)
    } catch (ex: NullPointerException) {
        response.sendError(HttpServletResponse.SC_CONFLICT, "Insufficient parameters provided!")
        HashMap()
    }

    /**
     * A request registers a new user
     * The response code 200 is returned, if the user was registered
     * The response code 403 is returned, if something went wrong
     * @param user: an instance of the class [User] which specifies the user credentials
     * @param response: an instance of the class [HttpServletResponse]
     */
    @PostMapping("/register")
    fun register(@RequestBody data: Map<String, String>, response: HttpServletResponse) = try {
        val uid = data["uid"]!!
        val pubK = data["pubK"]!!
        val privK = data["privK"]!!
        val user = User(uid, pubK, privK)
        userRepository.add(user)
        couchDBConnectionProvider.createCouchDbConnector(user.uid)
        couchDBConnectionProvider.createCouchDbConnector("${user.uid}-meta")
        response.status = HttpServletResponse.SC_OK
    } catch (ex: NullPointerException) {
        response.sendError(HttpServletResponse.SC_CONFLICT, "Insufficient parameters provided!")
    } catch (ex: DbAccessException) {
        response.sendError(HttpServletResponse.SC_FORBIDDEN, "User already exists!")
    }
}