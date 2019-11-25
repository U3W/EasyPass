package dev.easypass.auth.security

import dev.easypass.auth.security.challenge.InternalAdministrationChallenge
import dev.easypass.auth.datstore.document.User
import org.springframework.stereotype.Component
import java.util.*

/**
 * Provides a variety of different security methods
 * @param properties: the application.properties as java bean
 */
@Component
class EncryptionLibrary(private val properties: Properties) {
    /**
     * Generates an object of the class [InternalAdministrationChallenge]
     */
    fun generateInternalAdministrationChallenge(): InternalAdministrationChallenge {
        return InternalAdministrationChallenge(this, properties)
    }

    /**
     * Generates an object of the class [User] with random values
     */
    fun generateDummyUser(uname: String): User {
        //TODO Ein wirkliches Keypair hinzufügen
        var publicKey = "D_U_M_M_Y___P_U_B_L_I_C___K_E_Y"
        var privateKey = "D_U_M_M_Y___P_R_I_V_A_T_E___K_E_Y"

        return User(uname, publicKey, privateKey)
    }

    /**
     * Generates a random [String] challenge
     */
    fun generateAuthenticationChallenge(): String {
        //TODO Eine wirkliche Challenge Erzeugung einbauen
        var challenge = "D_A_S___I_S_T___E_I_N_E___C_H_A_L_L_E_N_G_E"

        return challenge
    }

    /**
     * Encrypts the [text] with the passed [key]
     * @param text: that should be encrypted
     * @param key: to encrypt the [text]
     */
    fun encrypt(text: String, key: String): String{
        //TODO Gescheite Encryption machen
        var encrypted = "D_E_R___T_E_X_T___${text}___W_U_R_D_E___M_I_T___${key}___V_E_R_S_C_H_L_U_E_S_S_E_L_T"

        return encrypted
    }
}