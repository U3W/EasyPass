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


    registStep: "Schritt",
    registPrevButton: "Vorhäriger Schritt",
    registNextButton: "Nächster Schritt",
    registButton: "Registrieren",

    // verify - Masterpassword
    masterpassword: "Masterpasswort",
    masterpasswordPlace: "Bitte Ihr Masterpasswort eingeben",
    masterpass2FA: "2-Faktor-Option",
    masterpass2FAWebauthn: "Webauthn",
    masterpass2FAFile: "Key-File",
    masterpass2FAFileSelect: "Datei auswählen",
    masterpass2FAFileNoFile: "Keine Datei ausgewählt",
    masterpass2FAFileNotSup: "Nicht unterstützt",

    masterpassWrongLoginHeader: "Verifizierung nicht möglich!",
    masterpassWrongLogin: "Masterpasswort oder 2-Faktor-Option sind falsch!",

    /** Dashboard **/

    // Navbar Top
    searchPlaceholder: "Passwörter filtern",
    // Settings
    settings: "Einstellungen",
    language: "Sprache",
    german: "Deutsch",
    english: "Englisch",

    changePass: "Passwort ändern",
    changePassPass: "Passwort",
    changePassNew: "Neues Passwort",
    changePassNewRep: "Neue Passwort wiederholen",
    changePassBut: "Ändern",

    changePassMatch: "Das neue Passwort darf nicht mit Passwort übereinstimmen!",
    changePassSecNoMatch: "Die neuen Passwörter sitmmen nicht überein!",

    changePassAlertErr: "Passwort stimmt nicht mit dem ursprünglichen überein!",
    changePassAlertSucc: "Passwort geändert!",

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
    addCatAdd: "Hinzufügen",
    // alerts
    addCatSucc: "Kategorie hinzugefügt!",
    addCatErr: "Beim Hinzufügen der Kategorie ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut!",

    editCat: "Kategorie bearbeiten",
    editCatSelCat: "Kategorie auswählen",
    // alerts
    editCatSucc: "Bearbeitete Kategorie gespeichert!",
    editCatErr: "Beim Bearbeiten ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut!",

    delCat: "Kategorie löschen",
    delCatDel: "Löschen",
    // alerts
    delCatSuccSing: "Kategorie gelöscht ",
    delCatSuccMult: "Kategorien gelöscht ",
    delCatSucc2: "Rückgängig",
    delCatErrSing: "Beim Löschen der Kategorie ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut!",
    delCatErrMult: "Beim Löschen der Kategorien ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut!",

    // Navbar Bottom

    // Add Password
    addPass: "Passwort hinzufügen",

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

    // Add Pass Group
    addPassVis: "Passwort Sichtbarkeit",
    addPassUserTag: "Nutzer zur Gruppe hinzufügen",
    addPassUserInpPlaceholder: "Benutzernamen eingeben",

    addPassUserVis: "Gruppenmitglieder",
    addPassUserVis2: "Nutzer, die Einsicht in das Passwort haben",
    addPassUserVisNon: "Noch keine Nutzer hinzugefügt",

    addPassUserAlready: "Benutzername existiert nicht!",
    addPassUserNotFound: "Benutzer bereits hinzugefügt!",

    /** Main Window */
    mainPassGroup: "Gruppen Passwörter",
    mainPassPriv: "Private Passwörter",

    mainAllCat: "Alle Kategorien",

    noPassToCat: "Zu dieser Kategorie wurden noch keine Passwörter nicht hinzugefügt.",
    noCatsNoPass: "Noch keine Einträge.",

    mainNotAddedToCat: "Nicht zugeordnet",
    mainNotAddedToCatInfo: "Hier befinden sich alle Passwörter, die keine Kategorie zugeordnet wurden",


    // Pass Line

    lineTitle: "Titel",
    lineUser: "Benutzername",
    linePass: "Passwort",
    lineWebsite: "Website",

    lineTags: "Tags",
    lineCat: "Kategorie",
    lineCatNoCat: "Keiner Kategorie zugeordnet",

    lineTagsNotAdded: "Noch keine Tags hinzugefügt!",

    // Pass Line alerts
    lineCopyPass: "Passwort kopieren",
    lineCopyPassGoTo: "Passwort kopieren und Website öffnen",

    lineEdit: "Dieses Passwort bearbeiten",
    lineDel: "Dieses Passwort löschen",

    lineEditSave: "Änderungen speichern",
    lineEditCancle: "Änderungen verwerfen",

    // Pass Line alerts
    // Copy
    linePassCopiedSuc: "Passwort wurde in die Zwischenablage kopiert!",
    linePassCopiedErr: "Beim kopieren des Passworts ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut!",
    lineUserCopied: "Benutzername wurde in die Zwischenablage kopiert!",
    lineURLCopied: "URL wurde in die Zwischenablage kopiert!",


    // Delete Alert
    linePassDelSuc: "Passwort wurde gelöscht!",
    linePassDelSuc2: "Rückgängig",

    linePassDelErr: "Beim Löschen des Passworts ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut!",

    // Edit Alerts <-- Hier!
    linePassEditSuc: "Bearbeitetes Password gespeichert!",
    linePassEditErr: "Beim Bearbeiten des Passworts ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut!",

    // Add Alert
    linePassAddSuc: "Passwort hinzugefügt!",
    linePassAddErr: "Beim Hinzufügen des Passworts ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut!",



};

