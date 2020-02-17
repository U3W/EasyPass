package dev.easypass.auth.rest

import dev.easypass.auth.datstore.*
import dev.easypass.auth.datstore.document.*
import dev.easypass.auth.datstore.repository.*
import dev.easypass.auth.security.mapper.*
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
                          private val groupRepository: GroupRepository) {
    /**
     * A Request removes the current [Group] from the CouchDB-Datastore and deletes the corresponding database
     * @param request: an instance of the class [HttpServletRequest]
     * @param authentication: an instance of the class [Authentication]
     */
    @PostMapping("/{gid}/remove")
    fun removeGroup(@PathVariable gid: String, request: HttpServletRequest, authentication: Authentication) {
        groupRepository.removeAllByGid(gid)
        couchDBConnectionProvider.deleteCouchDbDatabase(gid)
        request.logout()
    }

    @PostMapping("/{gid}/pubK")
    fun getPubK(@PathVariable gid: String, response: HttpServletResponse): String {
        try {
            return groupRepository.findOneByGid(gid).pubK
        } catch (ex: DbAccessException) {
            response.sendError(HttpServletResponse.SC_CONFLICT, "Requested group not found!")
        }
        return ""
    }

    @PostMapping("/{gid}/add_user")
    fun addUser(@PathVariable gid: String, response: HttpServletResponse) {
        //TODO
    }

    @PostMapping("/{gid}/change_cred")
    fun changeCredentials(@PathVariable gid: String, @RequestBody cred: GroupCredentials, response: HttpServletResponse) {
        groupRepository.removeAllByGid(gid)
        groupRepository.add(Group(gid, cred.pubK, cred.privK, cred.apubK, cred.aprivK, ArrayList()))
    }
}