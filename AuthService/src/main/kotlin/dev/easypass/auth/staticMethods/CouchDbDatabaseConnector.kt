package dev.easypass.auth.staticMethods

import org.ektorp.CouchDbConnector
import org.ektorp.CouchDbInstance
import org.ektorp.http.StdHttpClient
import org.ektorp.impl.StdCouchDbInstance
import org.springframework.beans.factory.annotation.Value
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Configuration
import org.springframework.core.env.Environment
import org.springframework.beans.factory.InitializingBean
import org.springframework.context.EnvironmentAware
import org.springframework.stereotype.Service
import javax.annotation.PostConstruct

@Configuration
class CouchDbDatabaseConnector: EnvironmentAware {
    private var env: Environment? = null
    private var dbInstance: CouchDbInstance? = null

    init{
        val couchDBurl = env?.getProperty("couchdb.connection.url")
        env == null ?: println("Env ist null")
        println("-------------------------------!$couchDBurl!--------------------------------")
        val httpClient = StdHttpClient.Builder()
                .url(couchDBurl)
                .build()

        dbInstance = StdCouchDbInstance(httpClient)
    }

    override fun setEnvironment(environment: Environment) {
        this.env = environment;
    }

    fun getDBConnection(dbname: String): CouchDbConnector {
        return dbInstance?.createConnector(dbname, true)!!
    }
}