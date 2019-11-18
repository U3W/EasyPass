package dev.easypass.auth.customBeans

import dev.easypass.auth.data.AuthenticationChallenge
import dev.easypass.auth.data.AuthenticationForm
import dev.easypass.auth.data.User
import dev.easypass.auth.data.UserRepository
import org.springframework.web.bind.annotation.*
import java.util.*
import javax.servlet.http.HttpServletResponse
import kotlin.collections.HashMap

@RestController
class EPRestAPIController(private val userRepository: UserRepository, private val epDatabaseConnector: EPDatabaseConnector, private val epEncryptionLibrary: EPEncryptionLibrary) {

    private var currentChallenges = HashMap<String, AuthenticationChallenge>()
    @GetMapping("/")
    fun index(response: HttpServletResponse) {
        response.sendRedirect("https://easypass.dev/")
    }

    //curl -X POST -d 'mwustinger' http://localhost:7000/auth/getAuthenticationForm
    @PostMapping("/auth/getAuthenticationForm")
    @ResponseBody
    fun getAuthenticationForm(@RequestBody uname: String): AuthenticationForm {
        val listOfUsersWithUname = userRepository.findByUname(uname)
        return if (listOfUsersWithUname.isNotEmpty()) {
            epEncryptionLibrary.generateAuthenticationForm(epEncryptionLibrary.generateAuthenticationChallenge(), listOfUsersWithUname[0])
        } else {
            epEncryptionLibrary.generateAuthenticationForm(epEncryptionLibrary.generateAuthenticationChallenge(), epEncryptionLibrary.generateDummyUser(uname))
        }
    }

    /* Fill Database with User Entries
    curl -i -X POST -H "Content-Type: application/json" -d "{\"uname\": \"mwustinger\", \"publicKey\": \"M_A_R_T_I_N___P_U_B_L_I_C___K_E_Y\", \"privateKey\": \"M_A_R_T_I_N___P_R_I_V_A_T_E___K_E_Y\"}" http://localhost:7000/auth/register
    curl -i -X POST -H "Content-Type: application/json" -d "{\"uname\": \"kurbaniec\", \"publicKey\": \"K_A_C_P_E_R___P_U_B_L_I_C___K_E_Y\", \"privateKey\": \"K_A_C_P_E_R___P_R_I_V_A_T_E___K_E_Y\"}" http://localhost:7000/auth/register
    curl -i -X POST -H "Content-Type: application/json" -d "{\"uname\": \"mwelsch\", \"publicKey\": \"M_O_R_I_T_Z___P_U_B_L_I_C___K_E_Y\", \"privateKey\": \"M_O_R_I_T_Z___P_R_I_V_A_T_E___K_E_Y\"}" http://localhost:7000/auth/register
    curl -i -X POST -H "Content-Type: application/json" -d "{\"uname\": \"swahl\", \"publicKey\": \"S_E_B___P_U_B_L_I_C___K_E_Y\", \"privateKey\": \"S_E_B___P_R_I_V_A_T_E___K_E_Y\"}" http://localhost:7000/auth/register

    */
    @PostMapping("/auth/register")
    @ResponseBody
    fun register(@RequestBody user: User): String {
        if (userRepository.findByUname(user.uname).isNotEmpty())
            return "UserAlreadyInDatabase"
        userRepository.add(user)
        epDatabaseConnector.createCouchDbConnector(user.uname)
        return "Success"
    }
}