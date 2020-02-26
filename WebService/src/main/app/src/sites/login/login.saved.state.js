import {loginConst} from "./login.enum";


class LoginState {

    getSaveUsernameState() {
        if ( localStorage.getItem(loginConst.saveUsername) === null ) {
            return false;
        }
        return localStorage.getItem(loginConst.saveUsername) !== false;
    }

    getSavedUsername() {
        if ( localStorage.getItem(loginConst.saveUsername) === null ) {
            return "";
        }
        return localStorage.getItem(loginConst.saveUsername);
    }

}


export default new LoginState;