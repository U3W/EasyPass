package dev.easypass.auth.datstore.document

import org.ektorp.support.*

/**
 * A [CouchDbDocument] subclass which allows the persistence of groupAccessCredentials in the database.
 * @param type: defines the entry as group access
 * @param gid: the name of the group.
 * @param gmk: the masterkey to authenticate a regular user.
 * @param amk: the masterkey to authenticate a admin user.
 */
class GroupAccessCredentials(val type: String = "group", val gid: String, val gmk: String, val amk: String?) : CouchDbDocument()