package dev.easypass.auth.security.challenge

/**
 * A mapper-class to receive the challenge credentials in json format
 * @param hash: the hash of the [dev.easypass.auth.datstore.document.User] or [dev.easypass.auth.datstore.document.Group]
 * @param role: specifies the role for which the challenge should be created
 */
class RequestChallenge(val hash: String, val role: String)