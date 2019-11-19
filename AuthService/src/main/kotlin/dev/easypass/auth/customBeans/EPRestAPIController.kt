package dev.easypass.auth.customBeans

import dev.easypass.auth.data.*
import org.ektorp.DocumentNotFoundException
import org.springframework.web.bind.annotation.*
import javax.servlet.http.HttpServletResponse


@RestController
class EPRestAPIController(private val userRepository: UserRepository, private val epDatabaseConnector: EPDatabaseConnector, private val epEncryptionLibrary: EPEncryptionLibrary) {

    private var currentChallenges = HashMap<String, ChallengeForUserAuth>()
    @GetMapping("/web")
    fun index(response: HttpServletResponse) {
        response.sendRedirect("https://easypass.dev/")
    }

    /*
curl -X GET http://localhost:7000/auth/getChallenge?uname=mwustinger
curl -X POST -H "Content-Type: application/json" -d "{\"uname\": \"mwustinger\", \"decryptedChallenge\": \"D_A_S___I_S_T___E_I_N_E___C_H_A_L_L_E_N_G_E\"}" http://localhost:7000/auth/checkChallenge
curl -X GET http://localhost:7000/couchdb/mwustinger
     */

    //curl -X GET http://localhost:7000/auth/getChallenge?uname=mwustinger
    @GetMapping("/auth/getChallenge")
    @ResponseBody
    fun getChallenge(@RequestParam uname: String): AuthenticationRequest {
        return try {
            println(uname)
            currentChallenges[uname] = epEncryptionLibrary.generateAuthenticationChallenge()
            epEncryptionLibrary.generateAuthenticationForm(currentChallenges[uname]!!, userRepository.findOneByUname(uname))
        } catch (ex: DocumentNotFoundException) {
            println(ex.message)
            epEncryptionLibrary.generateAuthenticationForm(epEncryptionLibrary.generateAuthenticationChallenge(), epEncryptionLibrary.generateDummyUser(uname))
        }
    }

    //curl -X POST -H "Content-Type: application/json" -d "{\"uname\": \"mwustinger\", \"decryptedChallenge\": \"D_A_S___I_S_T___E_I_N_E___C_H_A_L_L_E_N_G_E\"}" http://localhost:7000/auth/checkChallenge
    @PostMapping("/auth/checkChallenge")
    @ResponseBody
    fun checkChallenge(@RequestBody authenticationReply: AuthenticationReply): String {
        println(authenticationReply.uname)
        println(authenticationReply.decryptedChallenge)
        println(currentChallenges[authenticationReply.uname]?.decryptedChallenge)
        return if (currentChallenges[authenticationReply.uname]!=null && authenticationReply.decryptedChallenge==currentChallenges[authenticationReply.uname]?.decryptedChallenge) {
            currentChallenges.remove(authenticationReply.uname)
            "SUCCESS"
        } else {
            "REJECTED"
        }
    }

    /* Fill Database with User Entries
    curl -X POST -H "Content-Type: application/json" -d "{\"uname\": \"mwustinger\", \"publicKey\": \"M_A_R_T_I_N___P_U_B_L_I_C___K_E_Y\", \"privateKey\": \"M_A_R_T_I_N___P_R_I_V_A_T_E___K_E_Y\"}" http://localhost:7000/auth/register
    curl -X POST -H "Content-Type: application/json" -d "{\"uname\": \"kurbaniec\", \"publicKey\": \"K_A_C_P_E_R___P_U_B_L_I_C___K_E_Y\", \"privateKey\": \"K_A_C_P_E_R___P_R_I_V_A_T_E___K_E_Y\"}" http://localhost:7000/auth/register
    curl -X POST -H "Content-Type: application/json" -d "{\"uname\": \"mwelsch\", \"publicKey\": \"M_O_R_I_T_Z___P_U_B_L_I_C___K_E_Y\", \"privateKey\": \"M_O_R_I_T_Z___P_R_I_V_A_T_E___K_E_Y\"}" http://localhost:7000/auth/register
    curl -X POST -H "Content-Type: application/json" -d "{\"uname\": \"swahl\", \"publicKey\": \"S_E_B___P_U_B_L_I_C___K_E_Y\", \"privateKey\": \"S_E_B___P_R_I_V_A_T_E___K_E_Y\"}" http://localhost:7000/auth/register

    */
    @PostMapping("/auth/register")
    @ResponseBody
    fun register(@RequestBody user: User): String {
        if (userRepository.findByUname(user.uname).isNotEmpty())
            return "UserAlreadyInDatabase"
        userRepository.add(user)
        epDatabaseConnector.createCouchDbConnector(user.uname)
        return "SUCCESS"
    }
}