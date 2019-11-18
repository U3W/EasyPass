package dev.easypass.auth.data

import org.ektorp.support.CouchDbDocument

class Group(var gname: String, var pwd: String, var users: List<User>) : CouchDbDocument() {
}