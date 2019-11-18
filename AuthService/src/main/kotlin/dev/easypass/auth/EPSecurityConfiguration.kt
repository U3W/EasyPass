package dev.easypass.auth

import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.ComponentScan
import org.springframework.security.authentication.AuthenticationProvider
import java.security.AuthProvider

@Configuration
@EnableWebSecurity
class EPSecurityConfiguration(val authProvider: EPAuthenticationProvider) : WebSecurityConfigurerAdapter() {

    @Throws(Exception::class)
    override fun configure(auth: AuthenticationManagerBuilder) {
        auth.authenticationProvider(authProvider)
    }

    @Throws(Exception::class)
    override fun configure(http: HttpSecurity) {
        http.authorizeRequests().antMatchers("/auth/**", "/").permitAll().anyRequest().authenticated().and().httpBasic()
    }
}