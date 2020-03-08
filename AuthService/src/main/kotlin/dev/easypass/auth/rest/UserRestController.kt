package dev.easypass.auth.rest

import dev.easypass.auth.datstore.*
import dev.easypass.auth.datstore.document.*
import dev.easypass.auth.datstore.repository.*
import dev.easypass.auth.security.*
import org.ektorp.*
import org.springframework.security.authentication.*
import org.springframework.security.core.*
import org.springframework.security.core.authority.AuthorityUtils.*
import org.springframework.web.bind.annotation.*
import java.time.*
import java.util.*
import javax.servlet.http.*
import kotlin.collections.ArrayList
import kotlin.collections.HashMap

@RestController
@RequestMapping("/user")
class UserRestController(private val couchDBConnectionProvider: CouchDBConnectionProvider,
                         private val challengeAuthenticationProvider: ChallengeAuthenticationProvider,
                         private val userRepository: UserRepository,
                         private val groupRepository: GroupRepository,
                         private val encryptionLibrary: EncryptionLibrary) {
    @PostMapping("/remove")
    fun removeUser(request: HttpServletRequest, response: HttpServletResponse, authentication: Authentication) = try {
        val uid = getUidFromAuthentication(authentication)
        couchDBConnectionProvider.deleteCouchDbDatabase(uid)
        couchDBConnectionProvider.deleteCouchDbDatabase("$uid-meta")
        userRepository.removeAllByUid(uid)
        request.logout()
    } catch (ex: AuthenticationException) {
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Required authorities not available!")
    }

    @PostMapping("/create_group")
    fun createGroup(@RequestBody data: Map<String, String>, response: HttpServletResponse, authentication: Authentication) = try {
        val uid = getUidFromAuthentication(authentication)
        val gpubK = data["gpubK"]!!
        val gprivK = data["gprivK"]!!
        val apubK = data["apubK"]!!
        val aprivK = data["aprivK"]!!
        val gmk = data["gmk"]!!
        val amk = data["amk"]!!
        val title = data["title"]!!
        val gid = "g" + UUID.randomUUID().toString().replace("-", "")
        userRepository.findOneByUid(uid)
        couchDBConnectionProvider.createCouchDbConnector("${uid}-meta").create(GroupAccessCredentials("group", gid, gmk, amk))
        val members = ArrayList<String>()
        members.add(encryptionLibrary.encrypt(uid, gpubK))
        groupRepository.add(Group(gid, gpubK, gprivK, apubK, aprivK, members))
        couchDBConnectionProvider.createCouchDbConnector(gid).create(GroupSettings(title, encryptionLibrary.encrypt(LocalDateTime.now().toString(), gpubK)))
        response.status = HttpServletResponse.SC_OK
    } catch (ex: AuthenticationException) {
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Required authorities not available!")
    } catch (ex: NullPointerException) {
        response.sendError(HttpServletResponse.SC_CONFLICT, "Insufficient parameters provided!")
    }

    @PostMapping("/auth_group")
    fun authenticateGroup(@RequestBody data: Map<String, String>, request: HttpServletRequest, response: HttpServletResponse, authentication: Authentication) = try {
        val gid = data["gid"]!!
        val pwd = data["pwd"]!!
        challengeAuthenticationProvider.addAuthorities(gid, pwd, request.remoteAddr, authentication)
        response.status = HttpServletResponse.SC_OK
    } catch (ex: NullPointerException) {
        response.sendError(HttpServletResponse.SC_CONFLICT, "Insufficient parameters provided!")
    } catch (ex: AuthenticationException) {
        response.status = HttpServletResponse.SC_UNAUTHORIZED
    }

    @PostMapping("/my_keys")
    fun getOwnPubK(response: HttpServletResponse, authentication: Authentication): Map<String, Any> = try {
        val uid = getUidFromAuthentication(authentication)
        val keypair = HashMap<String, Any>()
        keypair["pubK"] = userRepository.findOneByUid(uid).pubK
        keypair["privK"] = userRepository.findOneByUid(uid).privK
        keypair
    } catch (ex: AuthenticationException) {
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Required authorities not available!")
        HashMap()
    } catch (ex: DbAccessException) {
        response.sendError(HttpServletResponse.SC_CONFLICT, "Corrupted Database!")
        HashMap()
    }

    @PostMapping("/pubkey")
    fun getPubK(@RequestBody data: Map<String, String>, response: HttpServletResponse, authentication: Authentication): Map<String, Any> = try {
        val uid = data["uid"]!!
        val pubK = HashMap<String, Any>()
        pubK["pubK"] = userRepository.findOneByUid(uid).pubK
        response.status = HttpServletResponse.SC_OK
        pubK
    } catch (ex: NullPointerException) {
        response.sendError(HttpServletResponse.SC_CONFLICT, "Insufficient parameters provided!")
        HashMap()
    } catch (ex: DbAccessException) {
        response.sendError(HttpServletResponse.SC_FORBIDDEN, "Wrong id provided!")
        HashMap()
    }
}

@Throws(AuthenticationException::class)
fun getUidFromAuthentication(authentication: Authentication): String {
    for (authority in authorityListToSet(authentication.authorities)) {
        if (authority.toString().startsWith("USER_"))
            return authority.toString().substringAfter("USER_", "")
    }
    throw InsufficientAuthenticationException("UserHash not found!")
}