package dev.easypass.auth

import org.springframework.boot.*
import org.springframework.boot.autoconfigure.*
import org.springframework.cloud.client.discovery.*
import org.springframework.cloud.netflix.zuul.*

@SpringBootApplication
@EnableZuulProxy
@EnableDiscoveryClient
class AuthApplication

fun main(args: Array<String>) {
    runApplication<AuthApplication>(*args)
}
