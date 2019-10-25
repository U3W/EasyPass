package dev.easypass.auth.exception

class EntityAlreadyinDatabaseException(message: String = "The given Entity already exists inside the database") : Exception(message)