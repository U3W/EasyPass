package dev.easypass.auth.datstore.repository

import dev.easypass.auth.datstore.document.*
import org.ektorp.*
import org.ektorp.support.*
import org.springframework.stereotype.*

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
    private fun findByGid(gid: String?): List<Group> {
        return queryView("by_gid", gid)
    }

    @Throws(DocumentNotFoundException::class, UpdateConflictException::class)
    fun findOneByGid(gid: String): Group {
        val list = findByGid(gid)
        if (list.isEmpty())
            throw DocumentNotFoundException("The Group [$gid] is NOT FOUND in the database")
        if (list.size > 1)
            throw UpdateConflictException()
        return list[0]
    }

    @Throws(UpdateConflictException::class)
    override fun add(entity: Group) = if (findByGid(entity.gid).isEmpty()) {
        super.add(entity)
    } else {
        throw UpdateConflictException()
    }

    fun removeAllByGid(gid: String) {
        for (group in findByGid(gid))
            remove(group)
    }

}