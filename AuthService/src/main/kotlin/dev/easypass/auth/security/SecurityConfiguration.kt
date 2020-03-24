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

@Configuration
@EnableWebSecurity
class SecurityConfiguration(private val authProvider: ChallengeAuthenticationProvider,
                            private val groupFilter: GroupFilter,
                            private val adminFilter: AdminFilter,
                            private val storeFilter: StoreFilter) : WebSecurityConfigurerAdapter() {
    @Throws(Exception::class)
    override fun configure(auth: AuthenticationManagerBuilder) {
        auth.authenticationProvider(authProvider)
    }

    @Throws(Exception::class)
    override fun configure(http: HttpSecurity) {
        http
                .csrf().disable() //.and().httpBasic()
                .exceptionHandling()
                .authenticationEntryPoint(RestAuthenticationEntryPoint())
        http
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
                .addFilterBefore(groupFilter, AnonymousAuthenticationFilter::class.java)
                .addFilterBefore(adminFilter, AnonymousAuthenticationFilter::class.java)
                .addFilterBefore(storeFilter, AnonymousAuthenticationFilter::class.java)
    }
}
