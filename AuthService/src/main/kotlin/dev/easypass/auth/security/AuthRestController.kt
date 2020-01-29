package dev.easypass.auth.security

import dev.easypass.auth.datstore.CouchDBConnectionProvider
import dev.easypass.auth.datstore.document.Group
import dev.easypass.auth.datstore.document.User
import dev.easypass.auth.datstore.repository.GroupRepository
import dev.easypass.auth.datstore.repository.UserRepository
import dev.easypass.auth.security.challenge.RequestChallenge
import dev.easypass.auth.security.challenge.ResponseChallenge
import org.ektorp.DbAccessException
import org.springframework.web.bind.annotation.*
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

/**
 * This [RestController] provides the Rest-Api for the user authentication
 */
@RestController
@RequestMapping("/auth")
class AuthRestController(private val challengeAuthenticationProvider: ChallengeAuthenticationProvider,
                         private val couchDBConnectionProvider: CouchDBConnectionProvider,
                         private val userRepository: UserRepository,
                         private val groupRepository: GroupRepository) {

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
    fun register(@RequestBody user: User, response: HttpServletResponse) = try {
        userRepository.add(user)
        couchDBConnectionProvider.createCouchDbConnector(user.uname)
        response.status = HttpServletResponse.SC_OK
    } catch (ex: DbAccessException) {
        response.sendError(HttpServletResponse.SC_FORBIDDEN, "User was not registered!")
    }

    @PostMapping("/group")
    @ResponseBody
    fun createGroup(@RequestBody group: Group, response: HttpServletResponse) = try {
        groupRepository.add(group)
        couchDBConnectionProvider.createCouchDbConnector(group.gname)
        response.status = HttpServletResponse.SC_OK
    } catch (ex: DbAccessException) {
        response.sendError(HttpServletResponse.SC_FORBIDDEN, "User was not registered!")
    }
}