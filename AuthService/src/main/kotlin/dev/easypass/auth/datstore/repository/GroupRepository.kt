package dev.easypass.auth.datstore.repository

import dev.easypass.auth.datstore.document.Group
import org.ektorp.CouchDbConnector
import org.ektorp.DocumentNotFoundException
import org.ektorp.UpdateConflictException
import org.ektorp.support.CouchDbRepositorySupport
import org.ektorp.support.GenerateView
import org.springframework.stereotype.Component

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
     * @param gname: the name of the group
     */
    @GenerateView
    private fun findByGname(gname: String?): List<Group> {
        return queryView("by_gname", gname)
    }

    /**
     * returns only the first entry of the [List] of all the entries with the passed [gname], that are stored in the database
     * @param gname: the name of the user
     */
    fun findOneByGname(gname: String): Group {
        val listOfUsers = findByGname(gname)
        if (listOfUsers.isEmpty())
            throw DocumentNotFoundException("The Group [$gname] is NOT FOUND in the database")
        if (listOfUsers.size > 1)
            throw DocumentNotFoundException("The Group [$gname] has MULTIPLE ENTRIES in the database")
        return listOfUsers[0]
    }

    /**
     * This methods overrides the add-method of [CouchDbRepositorySupport], throws an [UpdateConflictException], when an entity with the same gname as [entity] is already saved in the database
     * @param entity: a group object to save in the database
     */
    override fun add(entity: Group) = if (findByGname(entity.gname).isEmpty()) {
        super.add(entity)
    } else {
        throw UpdateConflictException()
    }

    fun removeAllByGname(gname: String) {
        for (group in findByGname(gname))
            remove(group)
    }
}