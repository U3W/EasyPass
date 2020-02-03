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
     * returns a [List] of all the entries with the passed [gname] that are stored in the database
     * @param gname: the name of the [Group]
     * @return a list of objects of the class [Group]
     */
    @GenerateView
    private fun findByGname(gname: String?): List<Group> {
        return queryView("by_gname", gname)
    }

    /**
     * returns only the first entry of the [List] of [findByGname]
     * @param gname: the name of the [Group]
     * @return an object of the class [Group]
     */
    @Throws(DocumentNotFoundException::class, UpdateConflictException::class)
    fun findOneByGname(gname: String): Group {
        val list = findByGname(gname)
        if (list.isEmpty())
            throw DocumentNotFoundException("The Group [$gname] is NOT FOUND in the database")
        if (list.size > 1)
            throw UpdateConflictException()
        return list[0]
    }

    /**
     * This methods overrides the add-method of [CouchDbRepositorySupport],
     * throws an [UpdateConflictException], when an entity with the same gname as [entity] is already saved in the database
     * @param entity: an object of the class [Group]
     */
    @Throws(UpdateConflictException::class)
    override fun add(entity: Group) = if (findByGname(entity.gname).isEmpty()) {
        super.add(entity)
    } else {
        throw UpdateConflictException()
    }

    /**
     * Removes all [Group]s with the given [gname]
     * @param gname: the name of the [Group]
     */
    fun removeAllByGname(gname: String) {
        for (group in findByGname(gname))
            remove(group)
    }
}