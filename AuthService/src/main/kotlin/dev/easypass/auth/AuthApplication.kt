package dev.easypass.auth

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.cloud.client.discovery.EnableDiscoveryClient
import org.springframework.cloud.netflix.zuul.EnableZuulProxy
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Primary
import org.springframework.util.ResourceUtils
import java.io.FileInputStream
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
