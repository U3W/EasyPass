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
    login: "Login",
    username: "Username",
    usernamePlaceholder: "Bitte Ihren Benutzernamen eingeben",
    password: "Passwort",
    passwordPlaceholder: "Bitte Ihr Passwort eingeben",

    rememberUsername: "Benutzernamen merken",

    loginButton: "Anmelden",

    wrongLoginHeader: "Anmeldung fehgeschlagen!",
    wrongLogin: "Username, Passwort oder 2-FA sind falsch!",

    registrationButton: "Noch kein Account? Hier registrieren",
    registrationAlertSucc: "Account hinzugefügt!",
    registrationAlertError: "Beim Hinzufügen des Accounts ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut!",



    // Registration
    regist: "Registrierung",
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

    // 2FA
    masterpass2FA: "2-Faktor-Schlüssel (Optional)",
    masterpass2FAFileDel: "Löschen",
    masterpass2FAFileSelect: "Datei auswählen",
    masterpass2FAFileNoFile: "Keine Datei ausgewählt",
    masterpass2FAFileNotSup: "Nicht unterstützt",


    /** Dashboard **/

    // Navbar Top
    searchPlaceholder: "Passwörter filtern",
    searchPlaceholderGroup: "Gruppen filtern",
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

    genKeyfile: "Neues Keyfile generieren",
    genButton: "Generieren",

    saveSetting: "Änderungen speichern",

    settingsChangePassSucc: "Passwort geändert",
    settingsChangePassErr: "Beim ändern des Passworts ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut!",

    settings2FA: "2FA-Optionen",
    settings2FAOpen: "Öffnen",

    settings2FAInfo1: "Mit der Aktivierung wird ein Keyfile heruntergeladen, dass Sie benötigen um sich einzuloggen.",
    settings2FAInfo2: "Bitte beachten Sie, dass Sie Sich ohne diesem File nicht mehr einloggen können!",
    settings2FAInfo3: "Aus Sicherheitsgründen bleibt die Möglichkeit, sich ohne Keyfile anzumelden für ca. 30 Minuten erhalten.",

    settings2FACurrA: "2FA-Key (zurzeit: aktiviert)",
    settings2FACurrD: "2FA-Key (zurzeit: deaktiviert)",
    settings2FAActivate: "Aktivieren",
    settings2FADeactivate: "Deaktivieren",
    settings2FAChangedSucc: "Änderungen Erfolgreich gespeichert",
    settings2FAChangedErr: "Beim speichern der Änderungen ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut!",

    userKeyHead: "Öffentlicher userkey",
    userKeySettings: "Userkey (einzigartige Nutzeridentifizierung)",
    userKeyShow: "Anzeigen",
    userKey: "Userkey",
    userKeyClose: "Schließen",

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
    editCatSave: "Speichern",
    editCatSelCat: "Kategorie auswählen",
    editCatNoCat: "Noch keine Kategorien hinzugefügt",
    // alerts
    editCatSucc: "Bearbeitete Kategorie gespeichert!",
    editCatErr: "Beim Bearbeiten ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut!",

    delCat: "Kategorie löschen",
    delCatDel: "Löschen",
    // alerts
    delCatSuccSing: "Kategorie gelöscht!",
    delCatSuccMult: "Kategorien gelöscht!",
    delCatSucc2: "Rückgängig",
    delCatErrSing: "Beim Löschen der Kategorie ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut!",
    delCatErrMult: "Beim Löschen der Kategorien ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut!",

    // Add Group
    addGroup: "Gruppe hinzufügen",
    addGroupBut: "Hinzufügen",

    addGroupName: "Name",

    // Vis
    addGroupVis: "Mitgliederverwaltung",
    addGroupUserTag: "Nutzer zur Gruppe hinzufügen",
    addGroupUserInpPlaceholder: "Benutzernamen eingeben",

    addGroupUserVis: "Gruppenmitglieder",
    addGroupUserVis2: "Nutzer, die Einsicht in das Passwort haben",
    addGroupUserVisNon: "Noch keine Nutzer hinzugefügt",

    addGroupUserAlready: "Benutzer bereits hinzugefügt!",
    addGroupUserNotFound: "Benutzername existiert nicht!",

    // Edit Group
    editGroup: "Gruppe bearbeiten",
    editGroupButton: "Speichern",

    // Add Password
    addPass: "Passwort hinzufügen",

    addPassTitle: "Titel",
    addPassGroup: "Gruppen Name",
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

    /** Main Window */
    mainPassGroup: "Gruppen Passwörter",
    mainPassPriv: "Private Passwörter",

    mainAllCat: "Alle Kategorien",

    noPassToCat: "Zu dieser Kategorie wurden noch keine Passwörter nicht hinzugefügt.",
    noCatsNoPass: "Noch keine Einträge!",

    mainNotAddedToCat: "Nicht zugeordnet",
    mainNotAddedToCatInfo: "Hier befinden sich alle Passwörter, die keine Kategorie zugeordnet wurden",

    // Group Card
    cardMenu: "Gruppen Menü - Alle Gruppen",

    cardGroupMembers: "Gruppenmitglieder:",

    cardEdit: "Diese Gruppe bearbeiten",
    cardDis: "Sie haben nicht die benötigten Rechte für diese Aktion!",
    cardDel: "Diese Gruppe löschen",
    cardOpen: "Diese Gruppe öffnen",
    cardReturn: "Zum Gruppemenü zurückkehren",

    // Group Card Single
    cardGroupMembersTab: "Gruppenmitglieder",
    cardGroupPassTab: "Passwörter",

    // Delete Alert
    cardDelSuc: "Gruppe wurde gelöscht!",
    cardDelSuc2: "Rückgängig",

    cardDelErr: "Beim Löschen der Gruppe ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut!",

    // Edit Alerts
    cardEditSuc: "Bearbeitete Gruppe gespeichert!",
    cardEditErr: "Beim Bearbeiten der Gruppe ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut!",

    // Add Alert
    cardAddSuc: "Gruppe hinzugefügt!",
    cardAddErr: "Beim Hinzufügen der Gruppe ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut!",

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

