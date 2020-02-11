package dev.easypass.auth.datstore.repository

import dev.easypass.auth.datstore.document.*
import org.ektorp.*
import org.ektorp.support.*
import org.springframework.stereotype.*

/**
 * Provides Ektorp Repository Support for the class [Group]
 * @param db: is initialized by the Bean [CouchDbConnector], the connection to the Database
 */
@Component
class GroupRepository(db: CouchDbConnector) : CouchDbRepositorySupport<Group>(Group::class.java, db) {

    /**
     * Generates the views required by the repository
     */
    init {
        //The initStandardDesignDocument-method throws a NullPointerException when a view already exists in the database
        for (doc in db.allDocIds) {
            if (doc.contains("_design/Group"))
                db.delete(doc, db.getCurrentRevision(doc))
        }
        initStandardDesignDocument()
    }

    /**
     * returns a [List] of all the entries with the passed [gid] that are stored in the database
     * @param gid: the name of the [Group]
     * @return a list of objects of the class [Group]
     */
    @GenerateView
    private fun findByGid(gid: String?): List<Group> {
        return queryView("by_gid", gid)
    }

    /**
     * returns only the first entry of the [List] of [findByGid]
     * @param gid: the name of the [Group]
     * @return an object of the class [Group]
     */
    @Throws(DocumentNotFoundException::class, UpdateConflictException::class)
    fun findOneByGid(gid: String): Group {
        val list = findByGid(gid)
        if (list.isEmpty())
            throw DocumentNotFoundException("The Group [$gid] is NOT FOUND in the database")
        if (list.size > 1)
            throw UpdateConflictException()
        return list[0]
    }

    /**
     * This methods overrides the add-method of [CouchDbRepositorySupport],
     * throws an [UpdateConflictException], when an entity with the same gid as [entity] is already saved in the database
     * @param entity: an object of the class [Group]
     */
    @Throws(UpdateConflictException::class)
    override fun add(entity: Group) = if (findByGid(entity.gid).isEmpty()) {
        super.add(entity)
    } else {
        throw UpdateConflictException()
    }

    /**
     * Removes all [Group]s with the given [gid]
     * @param gid: the name of the [Group]
     */
    fun removeAllByGid(gid: String) {
        for (group in findByGid(gid))
            remove(group)
    }
}