package dev.easypass.auth.customBeans

import dev.easypass.auth.CouchDBUsernameFilter
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter

@Configuration
@EnableWebSecurity
class EPSecurityConfiguration(private val authProviderSecurity: EPSecurityAuthenticationProvider) : WebSecurityConfigurerAdapter() {

    @Throws(Exception::class)
    override fun configure(auth: AuthenticationManagerBuilder) {
        auth.authenticationProvider(authProviderSecurity)
    }

    @Throws(Exception::class)
    override fun configure(http: HttpSecurity) {
        http
                .csrf().disable()
                .exceptionHandling()
                .and()
                .authorizeRequests()
                .antMatchers("/couchdb/**").permitAll()
                .antMatchers(HttpMethod.GET,"/auth/**").permitAll()
                .antMatchers("/**").denyAll()
                .and()
                .formLogin().loginPage("/auth/login")
                .failureHandler(SimpleUrlAuthenticationFailureHandler())
                .and()
                .logout();
        http.addFilterAfter(CouchDBUsernameFilter(), AnonymousAuthenticationFilter::class.java)
    }
}