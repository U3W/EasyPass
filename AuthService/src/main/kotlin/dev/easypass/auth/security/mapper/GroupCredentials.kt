package dev.easypass.auth.security.mapper

/**
 * A mapper-class to receive the group credentials in json format
 * @param pubK: the registered public key to create challenges used for the authentication of a regular user.
 * @param privK: a private key encrypted with the masterpassword used for the authentication of a regular user.
 * @param apubK: the registered public key to create challenges used for the authentication of an admin user.
 * @param aprivK: a private key encrypted with the masterpassword used for the authentication of an admin user.
 */
class GroupCredentials(val pubK: String, val privK: String, val apubK: String, val aprivK: String)