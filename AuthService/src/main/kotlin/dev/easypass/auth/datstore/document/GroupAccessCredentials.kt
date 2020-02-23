package dev.easypass.auth.datstore.document

import org.ektorp.support.*

class GroupAccessCredentials(val type: String, val gid: String, val gmk: String, val amk: String) : CouchDbDocument()