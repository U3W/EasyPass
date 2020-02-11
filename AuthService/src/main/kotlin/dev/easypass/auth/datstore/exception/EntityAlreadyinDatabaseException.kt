package dev.easypass.auth.datstore.exception

/**
 * This Exception is thrown if the unique identifier of an object is already saved in the database
 * @param message: is printed by the exception
 */
class EntityAlreadyinDatabaseException(message: String = "The given Entity already exists inside the database") : Exception(message)