package dev.easypass.auth.rest

import dev.easypass.auth.datstore.*
import dev.easypass.auth.datstore.document.*
import dev.easypass.auth.datstore.repository.*
import org.ektorp.*
import org.springframework.security.core.*
import org.springframework.web.bind.annotation.*
import javax.servlet.http.*

/**
 * This [RestController] provides the Rest-Api for the admin features
 * @param couchDBConnectionProvider: an instance of the class [CouchDBConnectionProvider] to access the CouchDB-Datastore
 * @param groupRepository: an instance of the class [GroupRepository] to gain CRUD operations for [Group]s
 */
@RestController
@RequestMapping("/admin")
class AdminRestController(private val couchDBConnectionProvider: CouchDBConnectionProvider,
                          private val userRepository: UserRepository,
                          private val groupRepository: GroupRepository) {
    /**
     * A Request removes the current [Group] from the CouchDB-Datastore and deletes the corresponding database
     * @param gid: the unique identifier of the [Group]
     * @param authentication: an instance of the class [Authentication]
     */
    @PostMapping("/{gid}/remove")
    fun removeGroup(@PathVariable gid: String, authentication: Authentication) {
        groupRepository.removeAllByGid(gid)
        couchDBConnectionProvider.deleteCouchDbDatabase(gid)
    }

    /**
     * Adds a regular [User] to the [Group], specified by the [gid]
     * @param gid: the unique identifier of the [Group]
     * @param data: the body of the rest-request, has to contain a "uid", "euid", "gmk"
     * @param response: required the return a http-errorcode
     */
    @PostMapping("/{gid}/add_user")
    fun addUser(@PathVariable gid: String, @RequestBody data: Map<String, Any>, response: HttpServletResponse) = try {
        val uid = data["uid"] as String
        val euid = data["euid"] as String
        val gmk = data["gmk"] as String
        val amk = data["amk"] as String
        groupRepository.findOneByGid(gid).members.add(euid)
        userRepository.findOneByUid(uid)
        couchDBConnectionProvider.createCouchDbConnector("${uid}-meta").create(GroupAccessCredentials("GROUP", gid, gmk, amk))
        response.status = HttpServletResponse.SC_OK
    } catch (ex: NullPointerException) {
        response.sendError(HttpServletResponse.SC_CONFLICT, "Wrong parameters provided!")
    } catch (ex: DbAccessException) {
        response.sendError(HttpServletResponse.SC_CONFLICT, "Wrong id provided!")
    }

    @PostMapping("/{gid}/change_cred")
    fun changeCredentials(@PathVariable gid: String, @RequestBody data: Map<String, Any>, response: HttpServletResponse) = try {
        val gpubK = data["gpubK"] as String
        val gprivK = data["gprivK"] as String
        val apubK = data["apubK"] as String
        val aprivK = data["aprivK"] as String
        groupRepository.removeAllByGid(gid)
        groupRepository.add(Group(gid, gpubK, gprivK, apubK, aprivK, ArrayList()))
        response.status = HttpServletResponse.SC_OK
    } catch (ex: NullPointerException) {
        response.sendError(HttpServletResponse.SC_CONFLICT, "Wrong parameters provided!")
    }
}