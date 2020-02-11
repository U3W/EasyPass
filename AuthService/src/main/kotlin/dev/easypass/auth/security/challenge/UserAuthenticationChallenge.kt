package dev.easypass.auth.security.challenge

/**
 * A simple converter class to provide the challenge credentials in json format to the user
 * @param encryptedChallenge: the challenge the user has to solve
 * @param encryptedPrivateKey: the private key the user can decrypt with his masterpassword to solve the challenge
 */
class UserAuthenticationChallenge(val encryptedChallenge: String, val encryptedPrivateKey: String) {
}