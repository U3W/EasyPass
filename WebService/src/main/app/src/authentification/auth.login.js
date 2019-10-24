import {connect} from "react-redux";
import {authConstants} from "./auth.const.localstorage";


class LoginAuth {

    getLoggedIn() {
        return localStorage.getItem(authConstants.loggedIn) === "true";
    }

}


export default new LoginAuth;