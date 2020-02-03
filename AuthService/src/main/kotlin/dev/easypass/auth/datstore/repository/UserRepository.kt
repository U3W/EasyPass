package dev.easypass.auth.datstore.repository

import dev.easypass.auth.datstore.document.*
import org.ektorp.*
import org.ektorp.support.*
import org.springframework.stereotype.*

/**
 * Provides Ektorp Repository Support for the class [User]
 * @param db: is initialized by the Bean [CouchDbConnector], the connection to the Database
 */
@Component
class UserRepository(db: CouchDbConnector) : CouchDbRepositorySupport<User>(User::class.java, db) {

    /**
     * Generates the views required by the repository
     */
    init {
        //The initStandardDesignDocument-method throws a NullPointerException when a view already exists in the database
        for (doc in db.allDocIds) {
            if (doc.contains("_design/User"))
                db.delete(doc, db.getCurrentRevision(doc))
        }
        initStandardDesignDocument()
    }

    /**
     * returns a [List] of all the entries with the passed [uname], that are stored in the database
     * @param uname: the name of the uname
     */
    @GenerateView
    private fun findByUname(uname: String?): List<User> {
        return queryView("by_uname", uname)
    }

    /**
     * returns only the first entry of the [List] of all the entries with the passed [uname], that are stored in the database
     * @param uname: the name of the user
     */
    fun findOneByUname(uname: String): User {
        val listOfUsers = findByUname(uname)
        if (listOfUsers.isEmpty())
            throw DocumentNotFoundException("The User [$uname] is NOT FOUND in the database")
        if (listOfUsers.size > 1)
            throw UpdateConflictException()
        return listOfUsers[0]
    }

    /**
     * This methods overrides the add-method of [CouchDbRepositorySupport], throws an [UpdateConflictException], when an entity with the same uname as [entity] is already saved in the database
     * @param entity: a user object to save in the database
     */
    override fun add(entity: User) = if (findByUname(entity.uname).isEmpty()) {
        super.add(entity)
    } else {
        throw UpdateConflictException()
    }

    fun removeAllByUname(uname: String) {
        for (user in findByUname(uname))
            remove(user)
    }
}