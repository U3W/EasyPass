/**
 * Doku:
 * Add: export const "nameOfString" = "String..."
 * Usage for 1: import { "nameOfString" } from '../strings.js';
 *      <Text style={{ fontSize: 22, textAlign: "center" }}>
 *          { NeverForget }
 *      </Text>
 * Usage for all: import * as constants from 'app/constants';
 *      <Text style={{ fontSize: 22, textAlign: "center" }}>
 *          { constants.NeverForget }
 *      </Text>
 */


export const strings = {
    // Login
    username: "Username",
    usernamePlaceholder: "Bitte Ihren Benutzernamen eingeben",
    password: "Passwort",
    passwordPlaceholder: "Bitte Ihr Passwort eingeben",

    keepLoggedIn: "Angemeldet bleiben",

    loginButton: "Anmelden",

    wrongLoginHeader: "Anmeldung fehgeschlagen!",
    wrongLogin: "Username oder Passwort sind falsch!",

    // Registration
    registButton: "Registrieren",

    // verify
    masterpassword: "Masterpasswort",

};

