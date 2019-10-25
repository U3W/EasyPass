package dev.easypass.auth.repositories

import org.ektorp.support.CouchDbDocument
import org.ektorp.support.TypeDiscriminator

class User(var uname: String, var public: String, var private: String) : CouchDbDocument() {
}