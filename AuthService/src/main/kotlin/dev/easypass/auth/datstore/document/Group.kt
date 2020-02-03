package dev.easypass.auth.datstore.document

import org.ektorp.support.*

/**
 * A [CouchDbDocument] subclass which allows the persistence of groups in the database.
 * @param gname: the name of the group.
 * @param pubK: the registered public key to create challenges used for the authentication of a regular user.
 * @param privK: a private key encrypted with the masterpassword used for the authentication of a regular user.
 * @param apubK: the registered public key to create challenges used for the authentication of an admin user.
 * @param aprivK: a private key encrypted with the masterpassword used for the authentication of an admin user.
 */
class Group(val gname: String = "Default", val pubK: String = "Default", val privK: String = "Default", val apubK: String = "Default", val aprivK: String = "Default") : CouchDbDocument()