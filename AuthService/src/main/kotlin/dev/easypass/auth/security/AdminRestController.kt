package dev.easypass.auth.security

import dev.easypass.auth.datstore.CouchDBConnectionProvider
import dev.easypass.auth.datstore.repository.GroupRepository
import dev.easypass.auth.datstore.repository.UserRepository
import org.ektorp.DbAccessException
import org.springframework.web.bind.annotation.*
import javax.servlet.http.HttpServletResponse

/**
 * This [RestController] provides the Rest-Api for the user authentication
 */
@RestController
@RequestMapping("/admin")
class AdminRestController(private val couchDBConnectionProvider: CouchDBConnectionProvider, private val userRepository: UserRepository, private val groupRepository: GroupRepository) {

    @PostMapping("/{hash}/remove")
    @ResponseBody
    fun unlockChallenge(@PathVariable hash: String, response: HttpServletResponse) = try {
        userRepository.remove(userRepository.findOneByUname(hash))
        couchDBConnectionProvider.deleteCouchDbDatabase(hash)
        response.status = HttpServletResponse.SC_OK
    } catch (ex: Exception) {
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "$hash was NOT successfully deleted!")
    }

}