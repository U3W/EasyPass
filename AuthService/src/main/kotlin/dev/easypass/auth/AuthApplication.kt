package dev.easypass.auth

import org.ektorp.CouchDbConnector
import org.ektorp.http.StdHttpClient
import org.ektorp.impl.StdCouchDbInstance
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.cloud.client.discovery.EnableDiscoveryClient
import org.springframework.cloud.netflix.zuul.EnableZuulProxy
import org.springframework.context.annotation.Bean
import org.springframework.core.env.Environment

@SpringBootApplication
@EnableZuulProxy
@EnableDiscoveryClient
class AuthApplication {
    @Autowired
    private val env: Environment? = null

    @Bean
    fun CouchDbConnector(): CouchDbConnector {
        val url = env?.getProperty("couchdb.url")
        val uname = env?.getProperty("couchdb.uname")
        val pwd = env?.getProperty("couchdb.pwd")
        val dbname = env?.getProperty("couchdb.dbname")
        val httpClient = StdHttpClient.Builder()
                .url(url)
                .username(uname)
                .password(pwd)
                .build()

        val dbInstance = StdCouchDbInstance(httpClient)
        return dbInstance.createConnector(dbname, true)!!
    }
}

fun main(args: Array<String>) {
    runApplication<AuthApplication>(*args)
}
