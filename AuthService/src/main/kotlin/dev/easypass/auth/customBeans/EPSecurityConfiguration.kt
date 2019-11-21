package dev.easypass.auth.customBeans

import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler

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
                .antMatchers("/couchdb/{uname}").hasAuthority("#uname")
                .antMatchers(HttpMethod.GET,"/auth/**").permitAll()
                .anyRequest().authenticated()
                .and()
                .formLogin()
                .failureHandler(SimpleUrlAuthenticationFailureHandler())
                .and()
                .logout();
    }
}