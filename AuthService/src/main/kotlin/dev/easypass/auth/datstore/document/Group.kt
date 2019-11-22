package dev.easypass.auth.datstore.document

import org.ektorp.support.CouchDbDocument

class Group(var gname: String, var pwd: String, var users: List<User>) : CouchDbDocument() {
}