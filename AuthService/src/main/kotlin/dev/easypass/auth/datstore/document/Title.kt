package dev.easypass.auth.datstore.document

import org.ektorp.support.*

/**
 * A [CouchDbDocument] subclass which allows the persistence of groupSettings in the database.
 * @param title: the title of the group.
 */
class Title(val title: String = "Default") : CouchDbDocument()