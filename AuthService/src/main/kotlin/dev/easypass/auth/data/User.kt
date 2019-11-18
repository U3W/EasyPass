package dev.easypass.auth.data

import org.ektorp.support.CouchDbDocument

/**
 * @uname: the username of the user
 * @public: the registered public key to create challenges for the user
 * @private: a private key encrypted with the masterpaassword of the user
 */
class User(var uname: String, var publicKey: String, var privateKey: String) : CouchDbDocument() {
}