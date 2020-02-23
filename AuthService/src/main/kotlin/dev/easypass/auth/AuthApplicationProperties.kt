package dev.easypass.auth

import org.springframework.context.annotation.*
import org.springframework.util.*
import java.io.*
import java.util.*

@Configuration
class AuthApplicationProperties {
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