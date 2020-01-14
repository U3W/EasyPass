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

    registrationButton: "Noch kein Account? Hier registrieren",
    registrationAlertSucc: "Account hinzugefügt!",
    registrationAlertError: "Beim Hinzufügen des Accounts ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut!",



    // Registration
    registUser: "Username",
    registUserInfo: "Mit diesem Benutzernamen können Sie sich später anmelden",
    registUserPlaceholder: "Bitte einen Nutzernamen eingeben",
    registUserAlreadyExist: "Ihr Nutzername existiert bereits!",

    registPass: "Passwort",
    registPassInfo: "Mit diesem Passwort können Sie Sich später anmelden",
    registPassPlaceholder: "Bitte ein Passwort eingeben",

    registPassSec: "Passwort wiederholen",
    registPassSecPlaceholder: "Bitte ihr Passwort wiederholen",

    registPassNotIdent: "Passwörter stimmen nicht überein!",

    registMaster: "Masterpasswort",
    registMasterInfo: "Mit diesem Masterpasswort werden ihre Passworter verschlüsselt. Dieses Passwort sollte ziemlich stark sein! Das Masterpasswort darf nicht mit dem normalen Account Passwort übereinstimmen!",
    registMasterPlaceholder: "Bitte ein sicheres Masterpasswort eingeben",

    registMasterSec: "Masterpasswort wiederholen",
    registMasterSecPlaceholder: "Bitte ihr Masterpasswort wiederholen",

    registMasterMatchPass: "Masterpasswort darf nicht mit dem Passwort übereinstimmen!",
    registMasterNotIdent: "Masterpasswörter stimmen nicht überein!",


    registPrevButton: "Vorhäriger Schritt",
    registNextButton: "Nächster Schritt",
    registButton: "Registrieren",

    // verify
    masterpassword: "Masterpasswort",


    /** Dashboard **/

    // Navbar Top
    searchPlaceholder: "Passwörter filtern",
    // Settings
    settings: "Einstellungen",
    language: "Sprache",
    german: "Deutsch",
    english: "Englisch",
    saveSetting: "Änderungen speichern",

    // Navbar Left
    menu: "Menü",
    privPass: "Private Passwörter",
    groupPass: "Gruppen Passwörter",
    cats: "Kategorien",
    catsAllCat: "Alle Kategorien",

    addCat: "Kategorie hinzufügen",
    addCatName: "Name",
    addCatDesc: "Beschreibung",

    editCat: "Kategorie bearbeiten",
    editCatSelCat: "Kategorie auswählen",

    delCat: "Kategorie löschen",
    delCatDel: "Löschen",

    // Navbar Bottom

    // Add Password
    addPas: "Passwort hinzufügen",

    addPassTitle: "Titel",
    addPassUser: "Benutzername",

    addPassPass: "Passwort",
    addPassGen: "Passwort generieren",
    addPassGenLen: "Länge",
    addPassGenChar: "Zeichen",
    addPassGenSmall: "Nur Kleinbuchstaben",
    addPassGenSpec: "Mit Sonderzeichen",
    addPassGenNum: "Mit Nummern",
    addPassGenAdd: "Hinzufügen",

    addPassWebsite: "Website (Login)",
    addPassTags: "Tags",
    addPassCat: "Kategorie",
    addPassCatNoCat: "Keiner Kategorie zugeordnet",
    addPassCatChange: "Kategorie ändern",

    addPassAdd: "Hinzufügen",



};

