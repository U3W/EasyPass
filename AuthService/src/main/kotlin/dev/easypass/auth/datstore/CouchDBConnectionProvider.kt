package dev.easypass.auth.datstore

import org.ektorp.*
import org.ektorp.http.*
import org.ektorp.impl.*
import org.springframework.context.annotation.*
import org.springframework.stereotype.*
import java.util.*

/**
 * Contains a bean, which provides a [CouchDbConnector] to the user-database, specified in the file application.properties
 * @param properties: the application.properties as java bean
 */
@Component
class CouchDBConnectionProvider(private val properties: Properties) {
    /**
     * The bean which provides the connection to the [dev.easypass.auth.datstore.document.User] database
     */
    @Bean
    @Primary
    fun UserDatabaseConnector(): CouchDbConnector {
        return createCouchDbConnector(properties.getProperty("couchDb.userDatabase"))
    }

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
     * Connects to a CouchDB-Database
     * @param dbname: the name of the database
     * @return an instance of the class [CouchDbConnector]
     */
    fun createCouchDbConnector(dbname: String): CouchDbConnector {
        return createCouchDbInstance().createConnector(dbname, true)
    }

    fun deleteCouchDbDatabase(dbname: String) {
        createCouchDbInstance().deleteDatabase(dbname)
    }
}