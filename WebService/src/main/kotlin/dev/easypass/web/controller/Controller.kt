package dev.easypass.web.controller

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseBody

/**
 * Serves the React App.
 *
 * @author Kacper Urbaniec
 * @version 2019-10-17
 */

@Controller
class Controller {

    // TODO find cleaner way instead of hard coding
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
    }

}