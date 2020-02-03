package dev.easypass.auth.rest

import dev.easypass.auth.datstore.CouchDBConnectionProvider
import dev.easypass.auth.datstore.document.Group
import dev.easypass.auth.datstore.repository.GroupRepository
import dev.easypass.auth.datstore.repository.UserRepository
import org.ektorp.DbAccessException
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.AuthorityUtils
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

/**
 * This [RestController] provides the Rest-Api for the user authentication
 */
@RestController
@RequestMapping("/admin")
class AdminRestController(private val couchDBConnectionProvider: CouchDBConnectionProvider, private val userRepository: UserRepository, private val groupRepository: GroupRepository) {

    @PostMapping("/remove")
    fun removeGroup(request: HttpServletRequest, response: HttpServletResponse, authentication: Authentication) {
        val authorities = AuthorityUtils.authorityListToSet(authentication.authorities)
        println("Rest $authorities ${request.requestURL}")
        for (auth in authorities) {
            val hash = auth.toString().substringAfter("HASH_")
            if (hash != auth) {
                if (authorities.contains("ROLE_USER"))
                    userRepository.removeAllByUname(hash)
                else if (authorities.contains("ROLE_ADMIN"))
                    groupRepository.removeAllByGname(hash)
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