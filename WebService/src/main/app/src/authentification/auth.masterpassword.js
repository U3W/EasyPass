import {authConstants} from "./auth.const.localstorage";
import {masterpasswordConst} from "../sites/verify/masterpassword.enum";


class VerifyAuth {

    getVerified() {
        return localStorage.getItem(authConstants.verified) === "true";
    }

    getRadioState() {
        if ( localStorage.getItem(masterpasswordConst.radioSelected) === null ) {
            return "file";
        }
        return localStorage.getItem(masterpasswordConst.radioSelected);
    }

}


export default new VerifyAuth;