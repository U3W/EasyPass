package dev.easypass.auth.security.mapper

/**
 * A mapper-class to provide the challenge credentials in json format to the user
 * @param enChallenge: the challenge the user has to solve
 * @param enPrivK: the private key the user can decrypt with his masterpassword to solve the challenge
 */
class ResponseChallenge(val enChallenge: String, val enPrivK: String)