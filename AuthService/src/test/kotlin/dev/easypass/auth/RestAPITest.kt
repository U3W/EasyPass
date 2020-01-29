package dev.easypass.auth

/*
import junit.framework.Assert.assertTrue
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.mock.http.server.reactive.MockServerHttpRequest.post
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc

@RunWith(SpringRunner::class)
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = ["classpath:test.properties"])
class RestAPITest {

    @Autowired
    private val mvc: MockMvc? = null

    @Test
    fun registerTest() {
        mvc!!.perform(post("/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"uname\": \"$testUname\", \"pwd\": \"$testPwd\"}"))

        val u = repo!!.findByUname(testUname)
        assertTrue(!u.isNullOrEmpty())
        assertTrue(u?.get(0)!!.checkPwd(testPwd))
    }
}
*/