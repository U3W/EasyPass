package dev.easypass.auth

import dev.easypass.auth.repositories.UserRepository
import org.ektorp.CouchDbConnector
import org.ektorp.http.StdHttpClient
import org.ektorp.impl.StdCouchDbInstance
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.cloud.client.discovery.EnableDiscoveryClient
import org.springframework.cloud.netflix.zuul.EnableZuulProxy
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Primary
import org.springframework.util.ResourceUtils
import java.io.FileInputStream
import java.io.FileReader
import java.util.Properties

@SpringBootApplication
@EnableZuulProxy
@EnableDiscoveryClient
class AuthApplication {

    @Bean
    @Primary
    fun ApplicationProperties(): Properties {
        val properties = Properties()
        val file = ResourceUtils.getFile("classpath:application.properties")
        val stream = FileInputStream(file)
        properties.load(stream)
        return properties
    }

    @Bean
    @Primary
    fun CouchDbConnector(properties: Properties): CouchDbConnector {
        val url = properties.getProperty("couchdb.url")
        val uname = properties.getProperty("couchdb.uname")
        val pwd = properties.getProperty("couchdb.pwd")
        val dbname = properties.getProperty("couchdb.dbname")
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
