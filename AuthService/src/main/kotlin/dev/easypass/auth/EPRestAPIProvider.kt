package dev.easypass.auth

import dev.easypass.auth.process.Challenge
import dev.easypass.auth.repositories.UserRepository
import dev.easypass.auth.process.generateDummyUser
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.env.Environment
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.*
import javax.servlet.http.HttpServletResponse
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.ResponseBody
import javax.ws.rs.GET
import org.springframework.web.bind.annotation.RequestMapping




@RestController
@Component
class EPRestAPIProvider {
    @Autowired
    private val userRepository:  UserRepository? = null

    @Autowired
    private val environment: Environment? = null

    private var currentChallenges = HashMap<String, Challenge>()

    @RequestMapping(value = ["/"])
    fun index(response: HttpServletResponse) {
        response.sendRedirect("https://easypass.dev/")
    }

    @RequestMapping(value = ["/auth/{uname}/getChallenge"], method = [RequestMethod.GET])
    @ResponseBody
    fun authenticate(@PathVariable("uname") uname: String): String {
        val listOfUsers = userRepository!!.findByUname(uname)
        val user = if (listOfUsers.isNotEmpty()) listOfUsers[0] else generateDummyUser()
        val challenge = Challenge(environment?.getProperty("auth.challenge.Timeout")!!.toInt())
        currentChallenges[user.uname] = challenge

        val encryptedChallenge = challenge.getEncryptedChallenge(user.publicKey)
        val privateKey = user.privateKey
        return "{\"encryptedChallenge\": \"$encryptedChallenge\", \"privateKey\": \"$privateKey\"}"
    }


}