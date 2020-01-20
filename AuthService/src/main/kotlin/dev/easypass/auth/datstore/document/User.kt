package dev.easypass.auth.datstore.document

import org.ektorp.support.CouchDbDocument

/**
 * A [CouchDbDocument] subclass which allows to persist users in the database.
 * @uname: the username of the user.
 * @pubK: the registered public key to create challenges for the user.
 * @privK: a private key encrypted with the masterpaassword of the user.
 */
class User(val uname: String, val pubK: String, val privK: String) : CouchDbDocument() {
}