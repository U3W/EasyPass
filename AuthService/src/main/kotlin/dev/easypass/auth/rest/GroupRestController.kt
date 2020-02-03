package dev.easypass.auth.rest

import dev.easypass.auth.datstore.*
import dev.easypass.auth.datstore.repository.*
import org.springframework.security.core.*
import org.springframework.security.core.authority.*
import org.springframework.web.bind.annotation.*
import javax.servlet.http.*

/**
 * This [RestController] provides the Rest-Api for the user authentication
 */
@RestController
@RequestMapping("/group")
class GroupRestController(private val couchDBConnectionProvider: CouchDBConnectionProvider, private val userRepository: UserRepository, private val groupRepository: GroupRepository) {
    @PostMapping("/remove")
    fun removeGroup(request: HttpServletRequest, response: HttpServletResponse, authentication: Authentication) {
        val authorities = AuthorityUtils.authorityListToSet(authentication.authorities)
        println("Rest $authorities ${request.requestURL}")
        for (auth in authorities) {
            val hash = auth.toString().substringAfter("HASH_")
            if (hash != auth) {
                groupRepository.removeAllByGname(hash)
                couchDBConnectionProvider.deleteCouchDbDatabase(hash)
                request.logout()
            }
        }
    }
}