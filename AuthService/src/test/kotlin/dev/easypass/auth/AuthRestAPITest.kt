package dev.easypass.auth

import org.junit.runner.*
import org.springframework.boot.test.context.*
import org.springframework.test.context.*
import org.springframework.test.context.junit4.*


@RunWith(SpringRunner::class)
@SpringBootTest
@TestPropertySource(locations = ["classpath:test-application.properties"])
class AuthRestAPITest {
/*
    @Test
    @Throws(ClientProtocolException::class, IOException::class)
    fun registerUser_shouldReturnHTTP200() {
        val request: HttpUriRequest = HttpPost()
        val httpResponse = HttpClientBuilder.create().build().execute(request)
        assertEquals(HttpServletResponse.SC_OK, httpResponse.statusLine.statusCode)
    }*/
}
