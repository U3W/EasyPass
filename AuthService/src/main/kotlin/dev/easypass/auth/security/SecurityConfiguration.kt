package dev.easypass.auth.security

import dev.easypass.auth.security.filter.CouchDBAccessUsernameFilter
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler


/**
 * Contains the Security Configuration for the Authentication-Service  of the EasyPass-Application
 * @param authProvider: that contains the configuration for the custom Challenge-Authentication
 */
@Configuration
@EnableWebSecurity
class SecurityConfiguration(private val authProvider: ChallengeAuthenticationProvider) : WebSecurityConfigurerAdapter() {

    /**
     * This method is used to add the [ChallengeAuthenticationProvider] to Spring-Security
     * @param auth: the [AuthenticationManagerBuilder] were the [ChallengeAuthenticationProvider] is set
     */
    @Throws(Exception::class)
    override fun configure(auth: AuthenticationManagerBuilder) {
        auth.authenticationProvider(authProvider)
    }

    /**
     * Defines the url access control
     * @param http: the [HttpSecurity] were the configuration is set
     */
    @Throws(Exception::class)
    override fun configure(http: HttpSecurity) {
        http
                .csrf().disable()
                .exceptionHandling()
                .and()
                .authorizeRequests()
                .antMatchers("/couchdb/**").permitAll()
                .antMatchers(HttpMethod.POST,"/auth/**").permitAll()
                .anyRequest().authenticated()
                .and()
                .formLogin()
                .failureHandler(SimpleUrlAuthenticationFailureHandler())
                .and()
                .logout()

        http.addFilterAfter(CouchDBAccessUsernameFilter(), AnonymousAuthenticationFilter::class.java)
    }
}