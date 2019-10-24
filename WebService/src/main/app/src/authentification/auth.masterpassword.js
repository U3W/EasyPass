import {authConstants} from "./auth.const.localstorage";


class VerifyAuth {

    getVerified() {
        return localStorage.getItem(authConstants.verified) === "true";
    }

}


export default new VerifyAuth;