package dev.easypass.auth.security

import dev.easypass.auth.security.filter.AuthorizedForStoreFilter
import dev.easypass.auth.security.handler.RestAuthenticationEntryPoint
import dev.easypass.auth.security.handler.RestAuthenticationSuccessHandler
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler


/**
 * Contains the Security Configuration for the Authentication-Service  of the EasyPass-Application
 * @param authProvider: that contains the configuration for the custom Challenge-Authentication
 */
@Configuration
@EnableWebSecurity
class SecurityConfiguration(private val authProvider: ChallengeAuthenticationProvider, private val authorizedForStoreFilter: AuthorizedForStoreFilter) : WebSecurityConfigurerAdapter() {

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
                .authenticationEntryPoint(RestAuthenticationEntryPoint())

                .and()
                .authorizeRequests()
                .antMatchers(HttpMethod.POST,"/auth/**").permitAll()
                .antMatchers("/store/**").authenticated()
                .anyRequest().denyAll()

                .and()
                .formLogin()
                .loginPage("/auth/login")
                .successHandler(RestAuthenticationSuccessHandler())
                .failureHandler(SimpleUrlAuthenticationFailureHandler())

                .and()
                .logout()
                .logoutUrl("/auth/logout")
                .logoutSuccessHandler(HttpStatusReturningLogoutSuccessHandler(HttpStatus.OK))
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")

                .and()
                .addFilterAfter(authorizedForStoreFilter, AnonymousAuthenticationFilter::class.java)
    }
}
