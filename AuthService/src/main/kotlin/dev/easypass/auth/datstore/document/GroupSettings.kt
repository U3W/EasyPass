package dev.easypass.auth.datstore.document

import org.ektorp.support.*

class GroupSettings(val title: String, val lastModified: String) : CouchDbDocument()