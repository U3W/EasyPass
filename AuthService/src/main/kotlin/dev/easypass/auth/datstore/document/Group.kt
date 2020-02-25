package dev.easypass.auth.datstore.document

import org.ektorp.support.*

/**
 * A [CouchDbDocument] subclass which allows the persistence of groups in the database.
 * @param gid: the name of the group.
 * @param gpubK: the registered public key to create challenges used for the authentication of a regular user.
 * @param gprivK: a private key encrypted with the masterpassword used for the authentication of a regular user.
 * @param apubK: the registered public key to create challenges used for the authentication of an admin user.
 * @param aprivK: a private key encrypted with the masterpassword used for the authentication of an admin user.
 * @param members: a list of all users of that group encrypted by the [gpubK] of the group
 */
class Group(val gid: String = "Default", val gpubK: String = "Default", val gprivK: String = "Default", val apubK: String = "Default", val aprivK: String = "Default", val members: ArrayList<String> = ArrayList()) : CouchDbDocument()