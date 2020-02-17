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
 * This [RestController] provides the Rest-Api for the group features
 * @param groupRepository: an instance of the class [GroupRepository] to gain CRUD operations for [Group]s
 */
@RestController
@RequestMapping("/group")
class GroupRestController(private val groupRepository: GroupRepository) {

    @PostMapping("{gid}/members")
    fun getMembers(@PathVariable gid: String, response: HttpServletResponse, authentication: Authentication): List<String> {
        try {
            return groupRepository.findOneByGid(gid).members
        } catch (ex: DbAccessException) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Requested group not found!")
        }
        return ArrayList()

    }
}