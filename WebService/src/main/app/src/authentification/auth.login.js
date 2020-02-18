import {connect} from "react-redux";
import {authConstants} from "./auth.const.sessionstorage";


class LoginAuth {

    getLoggedIn() {
        if ( sessionStorage.getItem(authConstants.loggedIn) === null ) {
            return false;
        }
        return sessionStorage.getItem(authConstants.loggedIn) === "true";
    }
}


export default new LoginAuth;