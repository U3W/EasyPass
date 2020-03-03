package dev.easypass.auth.rest

import dev.easypass.auth.datstore.*
import dev.easypass.auth.datstore.document.*
import dev.easypass.auth.datstore.repository.*
import dev.easypass.auth.security.*
import org.ektorp.*
import org.springframework.web.bind.annotation.*
import javax.servlet.http.*

@RestController
@RequestMapping("/auth")
class AuthRestController(private val challengeAuthenticationProvider: ChallengeAuthenticationProvider,
                         private val couchDBConnectionProvider: CouchDBConnectionProvider,
                         private val userRepository: UserRepository) {
    @PostMapping("/challenge")
    fun unlockChallenge(@RequestBody data: Map<String, String>, request: HttpServletRequest, response: HttpServletResponse): Map<String, Any> = try {
        val uid = data["uid"]!!
        val role = data["role"]!!
        challengeAuthenticationProvider.addChallenge(Pair(request.remoteAddr, uid), role)
    } catch (ex: NullPointerException) {
        response.sendError(HttpServletResponse.SC_CONFLICT, "Insufficient parameters provided!")
        HashMap()
    }

    @PostMapping("/register")
    fun register(@RequestBody data: Map<String, String>, response: HttpServletResponse) = try {
        val uid = data["uid"]!!
        val pubK = data["pubK"]!!
        val privK = data["privK"]!!
        val user = User(uid, pubK, privK)
        userRepository.add(user)
        couchDBConnectionProvider.createCouchDbConnector(user.uid)
        couchDBConnectionProvider.createCouchDbConnector("${user.uid}-meta")
        response.status = HttpServletResponse.SC_OK
    } catch (ex: NullPointerException) {
        response.sendError(HttpServletResponse.SC_CONFLICT, "Insufficient parameters provided!")
    } catch (ex: DbAccessException) {
        response.sendError(HttpServletResponse.SC_FORBIDDEN, "User already exists!")
    }
}