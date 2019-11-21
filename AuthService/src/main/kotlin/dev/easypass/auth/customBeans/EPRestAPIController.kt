package dev.easypass.auth.customBeans

import dev.easypass.auth.data.*
import org.ektorp.DocumentNotFoundException
import org.springframework.web.bind.annotation.*
import javax.servlet.http.HttpServletResponse


@RestController
class EPRestAPIController(private val authenticationProvider: EPSecurityAuthenticationProvider) {
    /*
curl -i -X GET http://localhost:7000/auth/unlockChallenge?uname=mwustinger
curl -i -X POST -d username=mwustinger -d password=D_A_S___I_S_T___E_I_N_E___C_H_A_L_L_E_N_G_E -c /opt/cookies.txt http://localhost:7000/login
curl -i --header "Accept:application/json" -X GET -b /opt/cookies.txt http://localhost:7000/couchdb/mwustinger

    */

    @GetMapping("/web")
    fun index(response: HttpServletResponse) {
        response.sendRedirect("https://easypass.dev/")
    }
    @GetMapping("/test")
    fun test(): String {
        return "TEST"
    }

    @GetMapping("/auth/unlockChallenge")
    @ResponseBody
    fun unlockChallenge(@RequestParam uname: String): AuthenticationRequest {
        return authenticationProvider.addUserChallenge(uname)
    }
}