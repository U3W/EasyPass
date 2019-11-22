package dev.easypass.auth.datstore.repository

import dev.easypass.auth.datstore.document.Group
import dev.easypass.auth.datstore.exception.EntityAlreadyinDatabaseException
import org.ektorp.*
import org.ektorp.support.CouchDbRepositorySupport
import org.ektorp.support.GenerateView
import org.springframework.stereotype.Component

@Component
class GroupRepository(db: CouchDbConnector) : CouchDbRepositorySupport<Group>(Group::class.java, db) {

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
        if (findByGname(entity.gname).isNotEmpty()) {
            throw EntityAlreadyinDatabaseException()
        } else {
            throw DocumentNotFoundException("Exception is caught later! ")
        }
    } catch (e: DocumentNotFoundException) {
        super.add(entity)
    }

}