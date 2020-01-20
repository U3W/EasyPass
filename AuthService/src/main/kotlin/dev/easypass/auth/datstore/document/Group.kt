package dev.easypass.auth.datstore.document

import org.ektorp.support.CouchDbDocument

/**
 * A [CouchDbDocument] subclass which allows to persist groups in the database.
 * @param gname: the name of the group.
 * @param pubK: the registered public key to create challenges for the group for regular users.
 * @param privK: a private key encrypted with the masterpassword of the group for regular users.
 * @param pubK: the registered public key to create challenges for the group for admin users.
 * @param privK: a private key encrypted with the masterpassword of the group for admin user.
 */
class Group(val gname: String, val pubK: String, val privK: String, val apubK: String, val aprivK: String) : CouchDbDocument() {

}