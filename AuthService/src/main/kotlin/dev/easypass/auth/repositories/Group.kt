package dev.easypass.auth.repositories

import org.ektorp.support.CouchDbDocument

class Group(var gname: String, var pwd: String, var users: List<User>) : CouchDbDocument() {
}