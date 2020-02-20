package dev.easypass.auth.rest

import dev.easypass.auth.datstore.*
import dev.easypass.auth.datstore.document.*
import dev.easypass.auth.datstore.repository.*
import dev.easypass.auth.security.mapper.*
import org.ektorp.*
import org.springframework.security.core.*
import org.springframework.web.bind.annotation.*
import java.util.*
import javax.servlet.http.*
import kotlin.collections.ArrayList

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
    fun removeGroup(@PathVariable gid: String, authentication: Authentication) {
        groupRepository.removeAllByGid(gid)
        couchDBConnectionProvider.deleteCouchDbDatabase(gid)
    }

    @PostMapping("/{gid}/add_user")
    fun addUser(@PathVariable gid: String, @RequestBody data: Map<String, Any>, response: HttpServletResponse) {
        data["uid"]
    }

    @PostMapping("/{gid}/add_admin")
    fun addAdmin(@PathVariable gid: String, @RequestBody data: Map<String, Any>, response: HttpServletResponse) {
        //TODO
    }

    @PostMapping("/{gid}/change_cred")
    fun changeCredentials(@PathVariable gid: String, @RequestBody cred: GroupCredentials, response: HttpServletResponse) {
        groupRepository.removeAllByGid(gid)
        groupRepository.add(Group(gid, cred.pubK, cred.privK, cred.apubK, cred.aprivK, ArrayList()))
    }
}