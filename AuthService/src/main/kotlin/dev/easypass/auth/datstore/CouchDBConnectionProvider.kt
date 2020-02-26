package dev.easypass.auth.datstore

import org.ektorp.*
import org.ektorp.http.*
import org.ektorp.impl.*
import org.springframework.context.annotation.*
import org.springframework.stereotype.*
import java.util.*

@Component
class CouchDBConnectionProvider(private val properties: Properties) {
    @Bean
    @Primary
    fun UserDatabaseConnector(): CouchDbConnector {
        return createCouchDbConnector(properties.getProperty("couchDb.userDatabase"))
    }

    fun createCouchDbInstance(): StdCouchDbInstance {
        val url = properties.getProperty("couchDb.url")
        val uid = properties.getProperty("couchDb.username")
        val pwd = properties.getProperty("couchDb.password")
        val httpClient = StdHttpClient.Builder()
                .url(url)
                .username(uid)
                .password(pwd)
                .build()

        return StdCouchDbInstance(httpClient)
    }

    fun createCouchDbConnector(dbname: String): CouchDbConnector {
        return createCouchDbInstance().createConnector(dbname, true)
    }

    fun deleteCouchDbDatabase(dbname: String) {
        if (createCouchDbInstance().checkIfDbExists(dbname))
            createCouchDbInstance().deleteDatabase(dbname)
    }
}