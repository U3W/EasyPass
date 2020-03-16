package dev.easypass.auth.datstore.document

import org.ektorp.support.*

/**
 * A [CouchDbDocument] subclass which allows the persistence of groupSettings in the database.
 * @param lastModified: last time the members changed
 */
class LastModified(var lastModified: String = "Default") : CouchDbDocument()