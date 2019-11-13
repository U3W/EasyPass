package dev.easypass.auth

import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable


@RestController
class EPRestAPIProvider {
    @GetMapping(path = ["/auth/{uname}/getChallenge"])
    fun authenticate(@PathVariable("uname") uname: String): String {

        return "Hi"
    }

}