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
     * returns a [List] of all the entries with the passed [uid], that are stored in the database
     * @param uid: the name of the [User]
     * @return a list of objects of the class [User]
     */
    @GenerateView
    private fun findByUID(uid: String?): List<User> {
        return queryView("by_uid", uid)
    }

    /**
     * returns only the first entry of the [List] of all the entries with the passed [uid], that are stored in the database
     * @param uid: the name of the [User]
     * @return an object of the class [User]
     */
    @Throws(DocumentNotFoundException::class, UpdateConflictException::class)
    fun findOneByUID(uid: String): User {
        val list = findByUID(uid)
        if (list.isEmpty())
            throw DocumentNotFoundException("The User [$uid] is NOT FOUND in the database")
        if (list.size > 1)
            throw UpdateConflictException()
        return list[0]
    }

    /**
     * This methods overrides the add-method of [CouchDbRepositorySupport],
     * throws an [UpdateConflictException], when an entity with the same uid as [entity] is already saved in the database
     * @param entity: an object of the class [User]
     */
    @Throws(UpdateConflictException::class)
    override fun add(entity: User) = if (findByUID(entity.uid).isEmpty()) {
        super.add(entity)
    } else {
        throw UpdateConflictException()
    }

    /**
     * Removes all [User]s with the given [uid]
     * @param uid: the name of the [User]
     */
    fun removeAllByUID(uid: String) {
        for (user in findByUID(uid))
            remove(user)
    }
}