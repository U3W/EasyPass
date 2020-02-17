package dev.easypass.auth

import org.springframework.boot.*
import org.springframework.boot.autoconfigure.*
import org.springframework.cloud.client.discovery.*
import org.springframework.cloud.netflix.zuul.*
import org.springframework.context.annotation.*
import org.springframework.security.core.*
import org.springframework.security.core.authority.*
import org.springframework.util.*
import java.io.*
import java.util.*

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
}

fun main(args: Array<String>) {
    runApplication<AuthApplication>(*args)
}
