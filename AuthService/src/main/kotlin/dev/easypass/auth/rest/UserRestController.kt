package dev.easypass.auth.rest

import dev.easypass.auth.datstore.*
import dev.easypass.auth.datstore.document.*
import dev.easypass.auth.datstore.repository.*
import org.ektorp.*
import org.springframework.security.core.*
import org.springframework.security.core.authority.*
import org.springframework.web.bind.annotation.*
import javax.servlet.http.*

/**
 * This [RestController] provides the Rest-Api for the user features
 * @param couchDBConnectionProvider: an instance of the class [CouchDBConnectionProvider] to access the CouchDB-Datastore
 * @param userRepository: an instance of the class [UserRepository] to gain CRUD operations for [User]s
 * @param groupRepository: an instance of the class [GroupRepository] to gain CRUD operations for [Group]s
 */
@RestController
@RequestMapping("/user")
class UserRestController(private val couchDBConnectionProvider: CouchDBConnectionProvider,
                         private val userRepository: UserRepository,
                         private val groupRepository: GroupRepository) {

    /**
     * A Request removes the current [User] from the CouchDB-Datastore and deletes the corresponding database
     * @param request: an instance of the class [HttpServletRequest]
     * @param authentication: an instance of the class [Authentication]
     */
    @PostMapping("/remove")
    fun removeUser(request: HttpServletRequest, response: HttpServletResponse, authentication: Authentication) {
        val hash = getHash(authentication)
        if (hash != null) {
            userRepository.removeAllByUid(hash)
            couchDBConnectionProvider.deleteCouchDbDatabase("$hash-m")
            couchDBConnectionProvider.deleteCouchDbDatabase("$hash-p")
            couchDBConnectionProvider.deleteCouchDbDatabase("$hash-g")
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
    @PostMapping("/createGroup")
    fun createGroup(@RequestBody group: Group, response: HttpServletResponse, authentication: Authentication) = try {
        groupRepository.add(group)
        couchDBConnectionProvider.createCouchDbConnector("${group.gid}-p")
        val hash = getHash(authentication)
        if (hash != null) {
                //TODO Add current User as admin
        } else
            response.status = HttpServletResponse.SC_UNAUTHORIZED
        response.status = HttpServletResponse.SC_OK
    } catch (ex: DbAccessException) {
        response.status = HttpServletResponse.SC_FORBIDDEN
    }
}