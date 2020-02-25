package dev.easypass.auth.datstore.repository

import dev.easypass.auth.datstore.document.*
import org.ektorp.*
import org.ektorp.support.*
import org.springframework.stereotype.*

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
    private fun findByUid(uid: String?): List<User> {
        return queryView("by_uid", uid)
    }

    @Throws(DocumentNotFoundException::class, UpdateConflictException::class)
    fun findOneByUid(uid: String): User {
        val list = findByUid(uid)
        if (list.isEmpty())
            throw DocumentNotFoundException("The User [$uid] is NOT FOUND in the database")
        if (list.size > 1)
            throw UpdateConflictException()
        return list[0]
    }

    @Throws(UpdateConflictException::class)
    override fun add(entity: User) = if (findByUid(entity.uid).isEmpty()) {
        super.add(entity)
    } else {
        throw UpdateConflictException()
    }

    fun removeAllByUid(uid: String) {
        for (user in findByUid(uid))
            remove(user)
    }
}