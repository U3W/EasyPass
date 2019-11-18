package dev.easypass.auth.repositories

import dev.easypass.auth.exception.EntityAlreadyinDatabaseException
import org.ektorp.*
import org.ektorp.support.CouchDbRepositorySupport
import org.ektorp.support.GenerateView
import org.springframework.stereotype.Component

@Component
class UserRepository(db: CouchDbConnector) : CouchDbRepositorySupport<User>(User::class.java, db) {

    init {
        //The initStandardDesignDocument-method throws a NullPointerException when a view already exists in the database
        for (doc in db.allDocIds) {
            if (doc.contains("_design/User"))
                db.delete(doc, db.getCurrentRevision(doc))
        }
        initStandardDesignDocument()
    }

    @GenerateView
    fun findByUname(uname: String?): List<User> {
        return queryView("by_uname", uname)
    }

    override fun add(entity: User) = try {
            if (findByUname(entity.uname).isNotEmpty()) {
                throw EntityAlreadyinDatabaseException()
            } else {
                throw DocumentNotFoundException("Exception is caught later! ")
            }
        } catch (e: DocumentNotFoundException) {
            super.add(entity)
        }

}