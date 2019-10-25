package dev.easypass.auth.repositories

import dev.easypass.auth.exception.EntityAlreadyinDatabaseException
import dev.easypass.auth.staticMethods.*
import org.ektorp.*
import org.ektorp.support.CouchDbRepositorySupport
import org.ektorp.support.GenerateView
import org.springframework.stereotype.Component

@Component
class GroupRepository(db: CouchDbConnector = CouchDbDatabaseConnector().getDBConnection("UserManagement") ) : CouchDbRepositorySupport<Group>(Group::class.java, db) {

    init {
        //The initStandardDesignDocument-method throws a NullPointerException when a view already exists in the database
        for (doc in db.allDocIds) {
            if (doc.contains("_design/Group"))
                db.delete(doc, db.getCurrentRevision(doc))
        }
        initStandardDesignDocument()
    }

    @GenerateView
    fun findByGname(gname: String?): List<Group> {
        return queryView("by_gname", gname)
    }

    override fun add(entity: Group) = try {
        if (!findByGname(entity.gname).isEmpty()) {
            throw EntityAlreadyinDatabaseException()
        } else {
            throw DocumentNotFoundException("Exception is caught later! ")
        }
    } catch (e: DocumentNotFoundException) {
        super.add(entity)
    }

}