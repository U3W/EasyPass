package dev.easypass.web.controller

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.*

/**
 * Serves the React App.
 *
 * @author Kacper Urbaniec
 * @version 2019-10-17
 */

@Controller
class Controller {


    @GetMapping(value = ["/{path:^[^.]*\$}"])
    fun app(): String {
        return "index"
    }

    // In case of wrong url mappings use this:
    // TODO Remove this before release
    /**
    @GetMapping(value = ["/"])
    fun index(): String {
    return "index"
    }

    @GetMapping(value = ["/verify"])
    fun verify(): String {
    return "index"
    }

    @GetMapping(value = ["/dashboard"])
    fun dashboard(): String {
    return "index"
    }*/

    @GetMapping(value = ["/backendtest"])
    fun backendtest(): String {
        return "backendtest"
    }


    // TODO Get data from Eureka service
    @RequestMapping(value = ["/redirect"], method = [RequestMethod.GET], produces = ["application/json"])
    @ResponseBody
    @CrossOrigin(origins = ["*"])
    fun method(): Map<String, String> {
        return mapOf("db" to "http://localhost:5984/testdb")
    }

}