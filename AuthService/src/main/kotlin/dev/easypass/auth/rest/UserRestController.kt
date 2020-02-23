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

/**
 * This [RestController] provides the Rest-Api for the user features
 * @param couchDBConnectionProvider: an instance of the class [CouchDBConnectionProvider] to access the CouchDB-Datastore
 * @param userRepository: an instance of the class [UserRepository] to gain CRUD operations for [User]s
 * @param groupRepository: an instance of the class [GroupRepository] to gain CRUD operations for [Group]s
 */
@RestController
@RequestMapping("/user")
class UserRestController(private val couchDBConnectionProvider: CouchDBConnectionProvider,
                         private val challengeAuthenticationProvider: ChallengeAuthenticationProvider,
                         private val userRepository: UserRepository,
                         private val groupRepository: GroupRepository,
                         private val encryptionLibrary: EncryptionLibrary) {
    /**
     * A Request removes the current [User] from the CouchDB-Datastore and deletes the corresponding database
     * @param request: an instance of the class [HttpServletRequest]
     * @param authentication: an instance of the class [Authentication]
     */
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

    /**
     * A request creates a new group and sets the current User as admin
     * @param group: an instance of the class [Group] which specifies the group credentials
     * @param response: an instance of the class [HttpServletResponse]
     * @param authentication: an instance of the class [Authentication]
     */
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
        couchDBConnectionProvider.createCouchDbConnector("${uid}-meta").create(GroupAccessCredentials("GROUP", gid, gmk, amk))
        groupRepository.add(Group(gid, gpubK, gprivK, apubK, aprivK, ArrayList()))
        couchDBConnectionProvider.createCouchDbConnector(gid).create(GroupSettings(encryptionLibrary.encrypt(title, gpubK), encryptionLibrary.encrypt(LocalDateTime.now().toString(), gpubK)))
        response.status = HttpServletResponse.SC_OK
    } catch (ex: AuthenticationException) {
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Required authorities not available!")
    } catch (ex: NullPointerException) {
        response.sendError(HttpServletResponse.SC_CONFLICT, "Insufficient parameters provided!")
    } catch (ex: DbAccessException) {
        response.sendError(HttpServletResponse.SC_FORBIDDEN, "Wrong id provided!")
    }

    /**
     * A request tries to obtain access to a group by adding the required authorities to the session cookie
     * The authentication process similar to the regular user one
     * @param username: the [Group.gid] of that [Group]
     * @param password: the decrypted challenge earlier obtained by a request to [AuthRestController.unlockChallenge]
     * @param response: an instance of the class [HttpServletResponse]
     * @param authentication: an instance of the class [Authentication]
     */
    @PostMapping("/auth_group")
    fun authenticateGroup(@RequestBody data: Map<String, String>, request: HttpServletRequest, response: HttpServletResponse, authentication: Authentication) = try {
        val username = data["username"]!!
        val password = data["password"]!!
        challengeAuthenticationProvider.addAuthorities(username, password, request.remoteAddr, authentication)
        response.status = HttpServletResponse.SC_OK
    } catch (ex: NullPointerException) {
        response.sendError(HttpServletResponse.SC_CONFLICT, "Insufficient parameters provided!")
    } catch (ex: AuthenticationException) {
        response.status = HttpServletResponse.SC_UNAUTHORIZED
    }

    @PostMapping("/my_key")
    fun getOwnPubK(response: HttpServletResponse, authentication: Authentication): Map<String, Any> = try {
        val uid = getUidFromAuthentication(authentication)
        val keypair = HashMap<String, Any>()
        keypair["pubK"] = userRepository.findOneByUid(uid).pubK
        keypair["privK"] = userRepository.findOneByUid(uid).privK
        keypair
    } catch (ex: AuthenticationException) {
        response.sendError(HttpServletResponse.SC_CONFLICT, "Insufficient parameters provided!")
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

    /**
     * Filters the uid from the authorities of the given [Authentication]
     * @param authentication: an instance of the class [Authentication]
     * @return the uid of the given [Authentication]
     */
    @Throws(AuthenticationException::class)
    fun getUidFromAuthentication(authentication: Authentication): String {
        for (authority in authorityListToSet(authentication.authorities)) {
            if (authority.toString().startsWith("USER_"))
                return authority.toString().substringAfter("USER_", "")
        }
        throw InsufficientAuthenticationException("UserHash not found!")
    }

}