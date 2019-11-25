package dev.easypass.auth.datstore.document

import org.ektorp.support.CouchDbDocument
import java.security.PublicKey

/**
 * A [CouchDbDocument] subclass which allows to persist groups in the database.
 * @param gname: the name of the group.
 * @param publicKey: the registered public key to create challenges for the group.
 * @param privateKey: a private key encrypted with the masterpaassword of the group.
 * @param users: the [User]s allowed to access the group passwords, the authorities are saved as values
 */
class Group(var gname: String, var publicKey: String, var privateKey: String, var users: Map<User, String>) : CouchDbDocument() {
}