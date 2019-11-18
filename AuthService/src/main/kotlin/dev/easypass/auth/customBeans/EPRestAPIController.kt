package dev.easypass.auth.customBeans

import dev.easypass.auth.data.AuthenticationChallenge
import dev.easypass.auth.data.AuthenticationForm
import dev.easypass.auth.data.UserRepository
import org.springframework.web.bind.annotation.*
import java.util.*
import javax.servlet.http.HttpServletResponse
import kotlin.collections.HashMap

@RestController
class EPRestAPIController(private val userRepository: UserRepository, private val epEncryptionLibrary: EPEncryptionLibrary) {

    private var currentChallenges = HashMap<String, AuthenticationChallenge>()
    @GetMapping("/")
    fun index(response: HttpServletResponse) {
        response.sendRedirect("https://easypass.dev/")
    }

    //curl -i -X POST --data 'mwustinger' "http://localhost:7000/auth/getAuthenticationForm"
    @PostMapping("/auth/getAuthenticationForm")
    @ResponseBody
    fun authenticate(@RequestBody uname: String): AuthenticationForm {
        val listOfUsersWithUname = userRepository.findByUname(uname)
        return if (listOfUsersWithUname.isNotEmpty()) {
            epEncryptionLibrary.generateAuthenticationForm(epEncryptionLibrary.generateAuthenticationChallenge(), listOfUsersWithUname[0])
        } else {
            epEncryptionLibrary.generateAuthenticationForm(epEncryptionLibrary.generateAuthenticationChallenge(), epEncryptionLibrary.generateDummyUser(uname))
        }
    }


}