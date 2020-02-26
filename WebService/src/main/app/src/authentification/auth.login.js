import {connect} from "react-redux";
import {authConstants} from "./auth.const.sessionstorage";


class LoginAuth {

    getLoggedIn() {
        if ( sessionStorage.getItem(authConstants.loggedIn) === null ) {
            return false;
        }
        return sessionStorage.getItem(authConstants.loggedIn) === "true";
    }

    clear() {
        sessionStorage.setItem(authConstants.loggedIn, null);
    }

    getUsername() {
        if ( sessionStorage.getItem(authConstants.username) === null ) {
            return undefined;
        }
        return sessionStorage.getItem(authConstants.username);
    }
}


export default new LoginAuth;