package dev.easypass.auth.security

import dev.easypass.auth.security.filter.*
import dev.easypass.auth.security.handler.*
import org.springframework.context.annotation.*
import org.springframework.http.*
import org.springframework.security.config.annotation.authentication.builders.*
import org.springframework.security.config.annotation.web.builders.*
import org.springframework.security.config.annotation.web.configuration.*
import org.springframework.security.web.authentication.*
import org.springframework.security.web.authentication.logout.*


/**
 * Contains the Security Configuration for the Authentication-Service  of the EasyPass-Application
 * @param authProvider: that contains the configuration for the custom Challenge-Authentication
 */
@Configuration
@EnableWebSecurity
class SecurityConfiguration(private val authProvider: ChallengeAuthenticationProvider,
                            private val isGroupFilter: IsGroupFilter,
                            private val isAdminFilter: IsAdminFilter,
                            private val storeFilter: StoreFilter) : WebSecurityConfigurerAdapter() {
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
                .authorizeRequests()
                .antMatchers(HttpMethod.POST, "/auth/**").permitAll()
                .antMatchers(HttpMethod.POST, "/user/**").authenticated()
                .antMatchers(HttpMethod.POST, "/group/**").authenticated()
                .antMatchers(HttpMethod.POST, "/admin/**").authenticated()
                .antMatchers("/store/**").authenticated()
                .anyRequest().denyAll()
                .and()
                .addFilterBefore(isGroupFilter, AnonymousAuthenticationFilter::class.java)
                .addFilterBefore(isAdminFilter, AnonymousAuthenticationFilter::class.java)
                .addFilterBefore(storeFilter, AnonymousAuthenticationFilter::class.java)
    }
}
