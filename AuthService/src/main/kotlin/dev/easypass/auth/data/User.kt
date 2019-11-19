package dev.easypass.auth.data

import com.fasterxml.jackson.annotation.JsonProperty
import org.ektorp.support.CouchDbDocument

/**
 * @uname: the username of the user
 * @public: the registered public key to create challenges for the user
 * @private: a private key encrypted with the masterpaassword of the user
 */
class User(var uname: String = "DefaultUname", var publicKey: String = "DefaultPublicKey", var privateKey: String = "DefaultPrivateKey") : CouchDbDocument() {
}