package Easypass.SecurityProtoType
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.beans.factory.annotation.Autowired

@Configuration
@EnableWebSecurity
class SecSecurityConfig : WebSecurityConfigurerAdapter() {

    @Autowired
    private val authProvider: EPAuthenticationProvider? = null

    @Throws(Exception::class)
    override fun configure(auth: AuthenticationManagerBuilder) {
        auth.authenticationProvider(authProvider)
    }

    @Throws(Exception::class)
    override fun configure(http: HttpSecurity) {
        http.authorizeRequests().anyRequest().authenticated()
                .and()
                .formLogin()
                .loginPage("localhost:8090/login")
                .permitAll()
                .and()
                .logout()
                .permitAll();
    }
}