import {authConstants} from "../../authentification/auth.const.localstorage";

const initState = {

};

const authReducer = ( state = initState, action) => {
    switch (action.type) {
        case "LOGIN_SUCCESS":
            //console.log("Login success");
            localStorage.setItem(authConstants.loggedIn, "true");
            return {
                ...state,
                loggedIn: true
            };
        case "LOGIN_ERROR":
            localStorage.setItem(authConstants.loggedIn, "false");
            return {
            };

        case "LOGOUT_SUCCESS":
            //console.log("LastPart: Logout success");
            localStorage.setItem(authConstants.loggedIn, "false");
            localStorage.setItem(authConstants.verified, "false");
            return {
            };
        default:
            return {};
    }
};

export default authReducer;