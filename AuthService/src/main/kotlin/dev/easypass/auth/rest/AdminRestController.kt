package dev.easypass.auth.rest

import dev.easypass.auth.datstore.CouchDBConnectionProvider
import dev.easypass.auth.datstore.document.Group
import dev.easypass.auth.datstore.repository.GroupRepository
import dev.easypass.auth.datstore.repository.UserRepository
import org.ektorp.DbAccessException
import org.springframework.security.core.authority.AuthorityUtils
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

/**
 * This [RestController] provides the Rest-Api for the user authentication
 */
@RestController
@RequestMapping("/admin")
class AdminRestController(private val couchDBConnectionProvider: CouchDBConnectionProvider, private val userRepository: UserRepository, private val groupRepository: GroupRepository) {

    @PostMapping("/remove")
    fun removeGroup(request: HttpServletRequest, response: HttpServletResponse) {
        val authorities = AuthorityUtils.authorityListToSet(SecurityContextHolder.getContext().authentication.authorities)
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
        response.sendError(HttpServletResponse.SC_FORBIDDEN, "${group.gname} was not created!")
    }
}