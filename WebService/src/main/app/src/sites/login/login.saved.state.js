import {loginConst} from "./login.enum";


class LoginState {

    getRadioState() {
        if ( localStorage.getItem(loginConst.radioSelected) === null ) {
            return "file";
        }
        return localStorage.getItem(loginConst.radioSelected);
    }

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