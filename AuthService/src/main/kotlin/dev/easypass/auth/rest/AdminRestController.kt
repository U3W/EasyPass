package dev.easypass.auth.rest

import dev.easypass.auth.datstore.*
import dev.easypass.auth.datstore.document.*
import dev.easypass.auth.datstore.repository.*
import dev.easypass.auth.security.*
import org.ektorp.*
import org.springframework.security.core.*
import org.springframework.web.bind.annotation.*
import java.time.*
import javax.servlet.http.*


@RestController
@RequestMapping("/admin")
class AdminRestController(private val couchDBConnectionProvider: CouchDBConnectionProvider,
                          private val userRepository: UserRepository,
                          private val groupRepository: GroupRepository,
                          private val encryptionLibrary: EncryptionLibrary) {
    @PostMapping("/{gid}/remove")
    fun removeGroup(@PathVariable gid: String, authentication: Authentication) {
        groupRepository.removeAllByGid(gid)
        couchDBConnectionProvider.deleteCouchDbDatabase(gid)
    }

    @PostMapping("/{gid}/add_user")
    fun addUser(@PathVariable gid: String, @RequestBody data: Map<String, String>, response: HttpServletResponse) = try {
        val uid = data["uid"]!!
        val euid = data["euid"]!!
        val gmk = data["gmk"]!!
        var amk = data["amk"]
        val group = groupRepository.findOneByGid(gid)
        group.members.add(euid)
        couchDBConnectionProvider.UserDatabaseConnector().update(group)
        userRepository.findOneByUid(uid)
        couchDBConnectionProvider.createCouchDbConnector("${uid}-meta").create(GroupAccessCredentials("group", gid, gmk, amk))

        updateLastModified(gid)
        response.status = HttpServletResponse.SC_OK
    } catch (ex: NullPointerException) {
        response.sendError(HttpServletResponse.SC_CONFLICT, "Insufficient parameters provided!")
    } catch (ex: DbAccessException) {
        println(ex.message)
        response.sendError(HttpServletResponse.SC_FORBIDDEN, "Wrong id provided!")
    }

    @PostMapping("/{gid}/change_cred")
    fun changeCredentials(@PathVariable gid: String, @RequestBody data: Map<String, String>, response: HttpServletResponse, authentication: Authentication) = try {
        val uid = getUidFromAuthentication(authentication)
        val gpubK = data["gpubK"]!!
        val gprivK = data["gprivK"]!!
        val apubK = data["apubK"]!!
        val aprivK = data["aprivK"]!!
        val gmk = data["gmk"]!!
        val amk = data["amk"]!!
        userRepository.findOneByUid(uid)
        groupRepository.findOneByGid(gid)
        couchDBConnectionProvider.createCouchDbConnector("${uid}-meta").create(GroupAccessCredentials("group", gid, gmk, amk))
        groupRepository.removeAllByGid(gid)
        val members = ArrayList<String>()
        members.add(encryptionLibrary.encrypt(uid, gpubK))
        groupRepository.add(Group(gid, gpubK, gprivK, apubK, aprivK, members))

        updateLastModified(gid)
        response.status = HttpServletResponse.SC_OK
    } catch (ex: NullPointerException) {
        response.sendError(HttpServletResponse.SC_CONFLICT, "Insufficient parameters provided!")
    } catch (ex: DbAccessException) {
        println(ex.message)
        response.sendError(HttpServletResponse.SC_FORBIDDEN, "Wrong id provided!")
    }

    //@Throws(DocumentNotFoundException::class, UpdateConflictException::class)
    fun updateLastModified(gid: String) {
        val group = groupRepository.findOneByGid(gid)
        val db = couchDBConnectionProvider.createCouchDbConnector(gid)
        val lastModified = db.get(LastModified::class.java, "lastModified_")
        lastModified.lastModified = encryptionLibrary.encrypt(LocalDateTime.now().toString(), group.gpubK)
        db.update(lastModified)
    }
}