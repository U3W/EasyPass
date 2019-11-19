package dev.easypass.auth.data

class AuthenticationRequest(val encryptedChallenge: String, val encryptedPrivateKey: String) {
}