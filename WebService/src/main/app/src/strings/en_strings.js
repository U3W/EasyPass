import InputGroup from "react-bootstrap/InputGroup";
import React from "react";

export const strings = {
    // Login
    username: "Username",
    usernamePlaceholder: "Please enter username",
    password: "Password",
    passwordPlaceholder: "Please enter password",

    rememberUsername: "Save username",

    loginButton: "Login",

    wrongLoginHeader: "Login failed!",
    wrongLogin: "Username, password or 2-FA is incorrect!",

    registrationButton: "No account yet? Register here",
    registrationAlertSucc: "Account created!",
    registrationAlertError: "An error occurred while creating the account. Please try again!",

    // Registration
    registUser: "Username",
    registUserInfo: "With this username you can login later",
    registUserPlaceholder: "Please enter a username",
    registUserAlreadyExist: "This username already exists!",

    registPass: "Password",
    registPassInfo: "With this username you can login later",
    registPassPlaceholder: "Please enter a password",

    registPassSec: "Repeat password",
    registPassSecPlaceholder: "Please repeat your password",

    registPassNotIdent: "Passwords do not match!",

    registMaster: "Masterpassword",
    registMasterInfo: "With this master password your passwords are encrypted. This password should be strong! The master password must not match the normal account password!",
    registMasterPlaceholder: "Please enter a secure masterpassword",

    registMasterSec: "Repeat masterpassword",
    registMasterSecPlaceholder: "Please repeat your masterpassword",

    registMasterMatchPass: "Masterpassword must not match the password!",
    registMasterNotIdent: "Masterpasswords do not match!",


    registStep: "Step",
    registPrevButton: "Previous step",
    registNextButton: "Next step",
    registButton: "Register",

    // verify - masterpassword
    masterpassword: "Masterpassword",
    masterpasswordPlace: "Please enter masterpassword",
    masterpass2FA: "2-factor-option",
    masterpass2FAWebauthn: "Webauthn",
    masterpass2FAFile: "Key-File",
    masterpass2FAFileSelect: "Select file",
    masterpass2FAFileNoFile: "No file selected",
    masterpass2FAFileNotSup: "Not supported",

    masterpassWrongLoginHeader: "Verification not possible!",
    masterpassWrongLogin: "Masterpassword or 2-factor-option are wrong!",

    /** Dashboard **/

    // Navbar Top
    searchPlaceholder: "Filter passwords",
    searchPlaceholderGroup: "Filter groups",

    // Settings
    settings: "Settings",
    language: "Language",
    german: "German",
    english: "English",

    changePass: "Change password",
    changePassPass: "Password",
    changePassNew: "New password",
    changePassNewRep: "Repeat new password",
    changePassBut: "Change",

    changePassMatch: "The new password must not match the password!",
    changePassSecNoMatch: "New passwords do not match!",

    changePassAlertErr: "Password does not match the original one!",
    changePassAlertSucc: "Password changed!",

    genKeyfile: "Generate keyfile",
    genButton: "Generate",

    saveSetting: "Save settings",

    userKeyHead: "Public userkey",
    userKey: "Userkey",
    userKeyClose: "Close",

    // Navbar Left
    menu: "Menu",
    privPass: "Private passwords",
    groupPass: "Group passwords",

    cats: "Categories",
    catsAllCat: "All categories",

    addCat: "Add category",
    addCatName: "Name",
    addCatDesc: "Description",
    addCatAdd: "Add",
    // alerts
    addCatSucc: "Category added!",
    addCatErr: "An error occurred while adding the category. Please try again!",

    editCat: "Edit category",
    editCatSave: "Save",
    editCatSelCat: "Select category",
    editCatNoCat: "No categories added yet",
    // alerts
    editCatSucc: "Edited category saved!",
    editCatErr: "An error has occurred during editing. Please try again!",

    delCat: "Delete category",
    delCatDel: "Delete",
    // alerts
    delCatSuccSing: "Category deleted!",
    delCatSuccMult: "Categories deleted!",
    delCatSucc2: "undo",
    delCatErrSing: "An error occurred when deleting the category. Please try again!",
    delCatErrMult: "An error occurred when deleting the categories. Please try again!",

    // Navbar Bottom

    // Add Group
    addGroup: "Add group",
    addGroupBut: "Add",

    addGroupName: "Name",

    // Vis
    addGroupVis: "Member administration",
    addGroupUserTag: "Add user to group",
    addGroupUserInpPlaceholder: "Enter user name",

    addGroupUserVis: "Group members",
    addGroupUserVis2: "Users who have access to the password",
    addGroupUserVisNon: "No users added yet",

    addGroupUserAlready: "User already added!",
    addGroupUserNotFound: "Username does not exist!",

    // Edit Group
    editGroup: "Edit group",
    editGroupButton: "Save",

    // Add Password
    addPass: "Add password",
    addPassGroup: "Group name",
    addPassTitle: "Title",
    addPassUser: "Username",

    addPassPass: "Password",
    addPassGen: "Generate password",
    addPassGenLen: "Length",
    addPassGenChar: "Characters",
    addPassGenSmall: "Lower case only",
    addPassGenSpec: "With special characters",
    addPassGenNum: "With numbers",
    addPassGenAdd: "Add",

    addPassWebsite: "Website (Login)",
    addPassTags: "Tags",
    addPassCat: "Category",
    addPassCatNoCat: "Not assigned to any category",
    addPassCatChange: "Change category",

    addPassAdd: "Add",

    /** Main Window */
    mainPassGroup: "Group passwords",
    mainPassPriv: "Private passwords",

    mainAllCat: "All categories",

    noPassToCat: "No passwords have not yet been added to this category.",
    noCatsNoPass: "No entries yet!",

    mainNotAddedToCat: "Not assigned",
    mainNotAddedToCatInfo: "Here are all passwords that are not assigned to a category",

    // Group Card
    cardMenu: "Group menu - all groups",

    cardGroupMembers: "Group members:",

    cardEdit: "Edit this group",
    cardDel: "Delete this group",
    cardOpen: "Open this group",
    cardReturn: "Return to the group menu",

    // Delete Alert
    cardDelSuc: "Group deleted!",
    cardDelSuc2: "Undo",

    cardDelErr: "An error occurred when deleting the group. Please try again!",

    // Edit Alerts
    cardEditSuc: "Edited group saved!",
    cardEditErr: "An error occurred while editing the group. Please try again!",

    // Add Alert
    cardAddSuc: "Group added!",
    cardAddErr: "An error occurred while adding the group. Please try again!",

    // Pass Line

    lineTitle: "Title",
    lineUser: "Username",
    linePass: "Password",
    lineWebsite: "Website",

    lineTags: "Tags",
    lineCat: "Category",
    lineCatNoCat: "Not assigned to any category",

    lineTagsNotAdded: "No tags added yet!",

    // Pass Line alerts
    lineCopyPass: "Copy password",
    lineCopyPassGoTo: "Copy password and open website",

    lineEdit: "Edit this password",
    lineDel: "Delete this password",

    lineEditSave: "Save changes",
    lineEditCancle: "Discard changes",

    // Pass Line alerts
    // Copy
    linePassCopiedSuc: "Password was copied to the clipboard!",
    linePassCopiedErr: "An error occurred while copying the password. Please try again!",
    lineUserCopied: "Username was copied to the clipboard!",
    lineURLCopied: "URL was copied to the clipboard!",


    // Delete Alert
    linePassDelSuc: "Password has been deleted!",
    linePassDelSuc2: "Undo",

    linePassDelErr: "An error occurred when deleting the password. Please try again!",

    // Edit Alerts,
    linePassEditSuc: "Edited password saved!",
    linePassEditErr: "An error occurred while editing the password. Please try again!",

    // Add Alert
    linePassAddSuc: "Password added!",
    linePassAddErr: "An error occurred while adding the password. Please try again!",
};