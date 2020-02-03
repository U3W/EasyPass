package dev.easypass.auth.datstore

import org.ektorp.*
import org.ektorp.http.*
import org.ektorp.impl.*
import org.springframework.context.annotation.*
import org.springframework.stereotype.*
import java.util.*

/**
 * Contains a bean, which
 * @param properties: the application.properties as java bean
 */
@Component
class CouchDBConnectionProvider(private val properties: Properties) {
    /**
     * Provides a [CouchDbConnector] to the database where the [User] and [Group] objects are saved
     */
    @Bean
    @Primary
    fun UserDatabaseConnector(): CouchDbConnector {
        return createCouchDbConnector(properties.getProperty("couchDb.userDatabase"))
    }

    /**
     * Provides the [StdCouchDbInstance] described in the application.properties
     */
    fun createCouchDbInstance(): StdCouchDbInstance {
        val url = properties.getProperty("couchDb.url")
        val uname = properties.getProperty("couchDb.username")
        val pwd = properties.getProperty("couchDb.password")
        val httpClient = StdHttpClient.Builder()
                .url(url)
                .username(uname)
                .password(pwd)
                .build()

        return StdCouchDbInstance(httpClient)
    }

    /**
     * Provides a [CouchDbConnector] to a CouchDB-Database
     * @param dbname: the name of the database
     * @return an instance of the class [CouchDbConnector]
     */
    fun createCouchDbConnector(dbname: String): CouchDbConnector {
        return createCouchDbInstance().createConnector(dbname, true)
    }

    /**
     * Deletes a database in CouchDB, specified by the [dbname]
     * @param dbname: the name of the database
     */
    fun deleteCouchDbDatabase(dbname: String) {
        createCouchDbInstance().deleteDatabase(dbname)
    }
}