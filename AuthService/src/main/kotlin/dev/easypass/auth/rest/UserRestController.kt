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
 * This [RestController] provides the Rest-Api for the user authentication
 */
@RestController
@RequestMapping("/user")
class UserRestController(private val couchDBConnectionProvider: CouchDBConnectionProvider, private val userRepository: UserRepository, private val groupRepository: GroupRepository) {
    @PostMapping("/remove")
    fun removeUser(request: HttpServletRequest, response: HttpServletResponse, authentication: Authentication) {
        val authorities = AuthorityUtils.authorityListToSet(authentication.authorities)
        for (auth in authorities) {
            val hash = auth.toString().substringAfter("HASH_")
            if (hash != auth) {
                userRepository.removeAllByUname(hash)
                couchDBConnectionProvider.deleteCouchDbDatabase(hash)
                request.logout()
            }
        }
    }

    @PostMapping("/createGroup")
    fun createGroup(@RequestBody group: Group, response: HttpServletResponse) = try {
        groupRepository.add(group)
        couchDBConnectionProvider.createCouchDbConnector(group.gname)
        response.status = HttpServletResponse.SC_OK
    } catch (ex: DbAccessException) {
        response.status = HttpServletResponse.SC_FORBIDDEN
    }
}