package dev.easypass.auth.datstore.document

import org.ektorp.support.*

/**
 * A [CouchDbDocument] subclass which allows the persistence of users in the database.
 * @param gname: the name of the user.
 * @param pubK: the registered public key to create challenges used for the authentication of the user.
 * @param privK: a private key encrypted with the masterpassword used for the authentication of the user.
 */
class User(val uname: String = "Default", val pubK: String = "Default", val privK: String = "Default") : CouchDbDocument()