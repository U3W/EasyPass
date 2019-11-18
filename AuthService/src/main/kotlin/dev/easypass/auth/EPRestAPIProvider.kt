package dev.easypass.auth

import dev.easypass.auth.process.Challenge
import dev.easypass.auth.repositories.UserRepository
import dev.easypass.auth.process.generateDummyUser
import org.ektorp.DocumentNotFoundException
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.env.Environment
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.*
import java.util.*
import javax.servlet.http.HttpServletResponse
import kotlin.collections.HashMap

@RestController
@Component
class EPRestAPIProvider(val userRepository: UserRepository, val properties: Properties) {

    private var currentChallenges = HashMap<String, Challenge>()
    @RequestMapping(value = ["/"])
    fun index(response: HttpServletResponse) {
        response.sendRedirect("https://easypass.dev/")
    }

    @RequestMapping(value = ["/auth/authenticate"], method = [RequestMethod.POST])
    @ResponseBody
    fun authenticate(@RequestBody uname: String): String {
        /*val listOfUsers = userRepository!!.findByUname(uname)
        val user = if (listOfUsers.isNotEmpty()) listOfUsers[0] else generateDummyUser()
        val challenge = Challenge(environment?.getProperty("auth.challenge.Timeout")!!.toInt())
        currentChallenges[user.uname] = challenge

        val encryptedChallenge = challenge.getEncryptedChallenge(user.publicKey)
        val privateKey = user.privateKey
        return "{\"encryptedChallenge\": \"$encryptedChallenge\", \"privateKey\": \"$privateKey\"}"*/
        return "Hallo"
    }


}