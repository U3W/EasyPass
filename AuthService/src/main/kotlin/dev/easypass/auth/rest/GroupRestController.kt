package dev.easypass.auth.rest

import dev.easypass.auth.datstore.*
import dev.easypass.auth.datstore.document.*
import dev.easypass.auth.datstore.repository.*
import org.springframework.security.core.*
import org.springframework.security.core.authority.*
import org.springframework.web.bind.annotation.*
import javax.servlet.http.*

/**
 * This [RestController] provides the Rest-Api for the group features
 * @param couchDBConnectionProvider: an instance of the class [CouchDBConnectionProvider] to access the CouchDB-Datastore
 * @param groupRepository: an instance of the class [GroupRepository] to gain CRUD operations for [Group]s
 */
@RestController
@RequestMapping("/group")
class GroupRestController(private val couchDBConnectionProvider: CouchDBConnectionProvider,
                          private val groupRepository: GroupRepository) {
    /**
     * A Request removes the current [Group] from the CouchDB-Datastore and deletes the corresponding database
     * @param request: an instance of the class [HttpServletRequest]
     * @param authentication: an instance of the class [Authentication]
     */
    @PostMapping("/remove")
    fun removeGroup(request: HttpServletRequest, authentication: Authentication) {
        val authorities = AuthorityUtils.authorityListToSet(authentication.authorities)
        println("Rest $authorities ${request.requestURL}")
        for (auth in authorities) {
            val hash = auth.toString().substringAfter("HASH_")
            if (hash != auth) {
                groupRepository.removeAllByGname(hash)
                couchDBConnectionProvider.deleteCouchDbDatabase("$hash-m")
                couchDBConnectionProvider.deleteCouchDbDatabase("$hash-p")
                request.logout()
            }
        }
    }
}