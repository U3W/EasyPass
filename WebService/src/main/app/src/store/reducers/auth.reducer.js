import {authConstants} from "../../authentification/auth.const.sessionstorage";

const initState = {

};

const authReducer = ( state = initState, action) => {
    switch (action.type) {
        case "LOGIN_SUCCESS":
            //console.log("Login success");
            sessionStorage.setItem(authConstants.loggedIn, "true");
            return {
                ...state,
                loggedIn: true
            };
        case "LOGIN_ERROR":
            sessionStorage.setItem(authConstants.loggedIn, "false");
            return {
            };

        case "LOGOUT_SUCCESS":
            //console.log("LastPart: Logout success");
            sessionStorage.setItem(authConstants.loggedIn, "false");
            sessionStorage.setItem(authConstants.verified, "false");
            return {
            };
        default:
            return {};
    }
};

export default authReducer;