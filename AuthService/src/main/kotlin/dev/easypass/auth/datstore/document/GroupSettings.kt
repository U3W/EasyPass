package dev.easypass.auth.datstore.document

import org.ektorp.support.*
import java.time.*

class GroupSettings(val title: String, val lastModified: String) : CouchDbDocument()