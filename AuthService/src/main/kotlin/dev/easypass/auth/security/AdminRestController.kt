package dev.easypass.auth.security

import dev.easypass.auth.datstore.CouchDBConnectionProvider
import dev.easypass.auth.datstore.repository.GroupRepository
import dev.easypass.auth.datstore.repository.UserRepository
import dev.easypass.auth.security.challenge.RequestChallenge
import dev.easypass.auth.security.challenge.ResponseChallenge
import org.springframework.web.bind.annotation.*
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

/**
 * This [RestController] provides the Rest-Api for the user authentication
 */
@RestController
@RequestMapping("/admin")
class AdminRestController(private val couchDBConnectionProvider: CouchDBConnectionProvider, private val userRepository: UserRepository, private val groupRepository: GroupRepository) {

    @PostMapping("/{hash}/remove")
    @ResponseBody
    fun unlockChallenge(@PathVariable hash: String, response: HttpServletResponse) {
        userRepository.remove(userRepository.findOneByUname(hash))
    }
}