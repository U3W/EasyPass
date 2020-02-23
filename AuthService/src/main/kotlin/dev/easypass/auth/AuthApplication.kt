package dev.easypass.auth

import org.springframework.boot.*
import org.springframework.boot.autoconfigure.*
import org.springframework.cloud.client.discovery.*
import org.springframework.cloud.netflix.zuul.*
import org.springframework.context.annotation.*
import org.springframework.util.*
import java.io.*
import java.util.*

@SpringBootApplication
@EnableZuulProxy
@EnableDiscoveryClient
class AuthApplication

fun main(args: Array<String>) {
    runApplication<AuthApplication>(*args)
}
