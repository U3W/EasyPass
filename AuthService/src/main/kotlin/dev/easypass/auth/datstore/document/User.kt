package dev.easypass.auth.datstore.document

import org.ektorp.support.CouchDbDocument

/**
 * A [CouchDbDocument] subclass which allows to persist users in the database.
 * @uname: the username of the user.
 * @publicKey: the registered public key to create challenges for the user.
 * @privateKey: a private key encrypted with the masterpaassword of the user.
 */
class User(var uname: String = "DefaultUname", var publicKey: String = "DefaultPublicKey", var privateKey: String = "DefaultPrivateKey") : CouchDbDocument() {
}