package dev.easypass.auth.rest

import dev.easypass.auth.datstore.*
import dev.easypass.auth.datstore.document.*
import dev.easypass.auth.datstore.repository.*
import dev.easypass.auth.security.*
import dev.easypass.auth.security.mapper.*
import org.ektorp.*
import org.springframework.security.authentication.*
import org.springframework.security.core.*
import org.springframework.security.core.authority.AuthorityUtils.*
import org.springframework.web.bind.annotation.*
import java.util.*
import javax.servlet.http.*
import kotlin.collections.ArrayList

/**
 * This [RestController] provides the Rest-Api for the user features
 * @param couchDBConnectionProvider: an instance of the class [CouchDBConnectionProvider] to access the CouchDB-Datastore
 * @param userRepository: an instance of the class [UserRepository] to gain CRUD operations for [User]s
 * @param groupRepository: an instance of the class [GroupRepository] to gain CRUD operations for [Group]s
 */
@RestController
@RequestMapping("/user")
class UserRestController(private val couchDBConnectionProvider: CouchDBConnectionProvider,
                         private val challengeAuthenticationProvider: ChallengeAuthenticationProvider,
                         private val userRepository: UserRepository,
                         private val groupRepository: GroupRepository) {
    /**
     * A Request removes the current [User] from the CouchDB-Datastore and deletes the corresponding database
     * @param request: an instance of the class [HttpServletRequest]
     * @param authentication: an instance of the class [Authentication]
     */
    @PostMapping("/remove")
    fun removeUser(request: HttpServletRequest, response: HttpServletResponse, authentication: Authentication) {
        println("access")
        val hash = getUserHash(authentication)
        if (hash != null) {
            couchDBConnectionProvider.deleteCouchDbDatabase("$hash")
            couchDBConnectionProvider.deleteCouchDbDatabase("$hash-meta")
            userRepository.removeAllByUid(hash)
            request.logout()
        } else
            response.status = HttpServletResponse.SC_UNAUTHORIZED
    }

    /**
     * A request creates a new group and sets the current User as admin
     * @param group: an instance of the class [Group] which specifies the group credentials
     * @param response: an instance of the class [HttpServletResponse]
     * @param authentication: an instance of the class [Authentication]
     */
    @PostMapping("/create_group")
    fun createGroup(@RequestBody cred: GroupCredentials, response: HttpServletResponse, authentication: Authentication) = try {
        val gid = UUID.randomUUID().toString().replace("-", "")
        //val hash = getUserHash(authentication)
        //TODO Add current User as admin
        groupRepository.add(Group(gid, cred.pubK, cred.privK, cred.apubK, cred.aprivK, ArrayList()))
        couchDBConnectionProvider.createCouchDbConnector(gid)
        response.status = HttpServletResponse.SC_OK
    } catch (ex: DbAccessException) {
        response.status = HttpServletResponse.SC_CONFLICT
    }

    @PostMapping("/auth_group")
    fun authenticateGroup(username: String, password: String, response: HttpServletResponse, authentication: Authentication) = try {
        challengeAuthenticationProvider.authenticate(UsernamePasswordAuthenticationToken(username, password, authentication.authorities))
        response.status = HttpServletResponse.SC_OK
    } catch (ex: AuthenticationException) {
        response.status = HttpServletResponse.SC_UNAUTHORIZED
    }

    fun getUserHash(authentication: Authentication): String? {
        for (authority in authorityListToSet(authentication.authorities)) {
            println(authority)
            if (authority.toString().startsWith("USER_"))
                return authority.toString().substringAfter("USER_", "")
        }
        return null
    }
}