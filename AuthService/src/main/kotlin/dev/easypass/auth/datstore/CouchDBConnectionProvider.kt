package dev.easypass.auth.datstore

import org.ektorp.CouchDbConnector
import org.ektorp.http.StdHttpClient
import org.ektorp.impl.StdCouchDbInstance
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Primary
import org.springframework.stereotype.Component
import java.util.*

/**
 * Contains a bean, which provides a [CouchDbConnector] to the user-database, specified in the file application.properties
 * @param properties: the application.properties
 */
@Component
class CouchDBConnectionProvider(private val properties: Properties) {
    @Bean
    @Primary
    fun UserDatabaseConnector(): CouchDbConnector {
        return createCouchDbConnector(properties.getProperty("couchDB.userDatabase"))
    }

    /**
     * Connects to a CouchDB-Database
     * @param dbname: the name of the database
     * @return an instance of the class [CouchDbConnector]
     */
    fun createCouchDbConnector (dbname: String): CouchDbConnector {
        val url = properties.getProperty("couchDB.url")
        val uname = properties.getProperty("couchDB.username")
        val pwd = properties.getProperty("couchDB.password")
        val httpClient = StdHttpClient.Builder()
                .url(url)
                .username(uname)
                .password(pwd)
                .build()

        val dbInstance = StdCouchDbInstance(httpClient)
        return dbInstance.createConnector(dbname, true)
    }
}