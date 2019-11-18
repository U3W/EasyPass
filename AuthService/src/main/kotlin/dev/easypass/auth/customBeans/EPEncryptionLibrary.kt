package dev.easypass.auth.customBeans

import dev.easypass.auth.data.AuthenticationChallenge
import dev.easypass.auth.data.AuthenticationForm
import dev.easypass.auth.data.User
import org.springframework.stereotype.Component
import java.util.*

@Component
class EPEncryptionLibrary(private val properties: Properties) {
    fun generateAuthenticationChallenge(): AuthenticationChallenge {
        //TODO Eine wirkliche Challenge Erzeugung einbauen
        var challenge = "D_A_S___I_S_T___E_I_N_E___C_H_A_L_L_E_N_G_E"

        return AuthenticationChallenge(challenge, properties.getProperty("auth.challengeTimeout").toInt())
    }
    fun generateAuthenticationForm(challenge: AuthenticationChallenge, user: User): AuthenticationForm {
        return AuthenticationForm(encrypt(challenge.decryptedChallenge, user.publicKey), user.privateKey)
    }
    fun generateDummyUser(uname: String): User {
        //TODO Ein wirkliches Keypair hinzufügen
        var publicKey = "D_U_M_M_Y___P_U_B_L_I_C___K_E_Y"
        var privateKey = "D_U_M_M_Y___P_R_I_V_A_T_E___K_E_Y"

        return User(uname, publicKey, privateKey)
    }
    
    fun encrypt(text: String, key: String): String{
        //TODO Gescheite Encryption machen
        var encrypted = "D_E_R___T_E_X_T___${text}___W_U_R_D_E___M_I_T___${key}___V_E_R_S_C_H_L_U_E_S_S_E_L_T"

        return encrypted
    }
}