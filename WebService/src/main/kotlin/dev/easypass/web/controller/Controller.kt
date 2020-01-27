package dev.easypass.web.controller

import com.netflix.appinfo.InstanceInfo
import com.netflix.discovery.EurekaClient
import com.netflix.discovery.shared.Application
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Qualifier
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
    @Qualifier("eurekaClient")
    @Autowired
    private val eurekaClient: EurekaClient? = null

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

    @RequestMapping(value = ["/database"], method = [RequestMethod.GET], produces = ["application/json"])
    @ResponseBody
    @CrossOrigin(origins = ["*"])
    fun getIPAddress(): Map<String, String> {
        val serviceID = "auth-service"
        val application: Application = eurekaClient!!.getApplication(serviceID)
        val instanceInfo: InstanceInfo = application.instances[0]
        val url = instanceInfo.homePageUrl
        return mapOf("db" to "$url/auth/")
    }

}