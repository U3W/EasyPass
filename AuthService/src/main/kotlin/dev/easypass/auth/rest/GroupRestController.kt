package dev.easypass.auth.rest

import dev.easypass.auth.datstore.repository.*
import org.ektorp.*
import org.springframework.security.core.*
import org.springframework.web.bind.annotation.*
import javax.servlet.http.*

@RestController
@RequestMapping("/group")
class GroupRestController(private val groupRepository: GroupRepository) {
    @PostMapping("/{gid}/members")
    fun getMembers(@PathVariable gid: String, response: HttpServletResponse, authentication: Authentication): Map<String, Any> = try {
        val members = HashMap<String, Any>()
        members["members"] = groupRepository.findOneByGid(gid).members
        members
    } catch (ex: DbAccessException) {
        response.sendError(HttpServletResponse.SC_FORBIDDEN, "Wrong id provided!")
        HashMap()
    }
}