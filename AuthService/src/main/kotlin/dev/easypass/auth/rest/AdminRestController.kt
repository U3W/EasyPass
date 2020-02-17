package dev.easypass.auth.rest

import dev.easypass.auth.datstore.*
import dev.easypass.auth.datstore.document.*
import dev.easypass.auth.datstore.repository.*
import org.springframework.security.core.*
import org.springframework.security.core.authority.*
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
    @PostMapping("/remove")
    fun removeGroup(request: HttpServletRequest, authentication: Authentication) {
        val hash = getHash(authentication)
        if (hash != null) {
            groupRepository.removeAllByGid(hash)
            couchDBConnectionProvider.deleteCouchDbDatabase("$hash-m")
            couchDBConnectionProvider.deleteCouchDbDatabase("$hash-p")
            request.logout()
        }
    }

    @PostMapping("/pubK")
    fun getPubK(response: HttpServletResponse, authentication: Authentication): String {
        val hash = getHash(authentication)
        if (hash != null)
            return groupRepository.findOneByGid(hash).pubK
        else
            response.status = HttpServletResponse.SC_UNAUTHORIZED
        return ""
    }
}

fun getHash(authentication: Authentication): String? {
    val authorities = AuthorityUtils.authorityListToSet(authentication.authorities)
    for (auth in authorities) {
        val hash = auth.toString().substringAfter("HASH_")
        if (hash != auth) {
            return hash
        }
    }
    return null
}