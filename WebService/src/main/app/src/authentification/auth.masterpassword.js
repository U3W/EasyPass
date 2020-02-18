import {authConstants} from "./auth.const.sessionstorage";
import {masterpasswordConst} from "../sites/verify/masterpassword.enum";


class VerifyAuth {

    getVerified() {
        if ( sessionStorage.getItem(authConstants.verified) === null ) {
            return false;
        }
        return sessionStorage.getItem(authConstants.verified) === "true";
    }

}


export default new VerifyAuth;