import {authConstants} from "../../authentification/auth.const.sessionstorage";

const initState = {

};

const verifyReducer = ( state = initState, action) => {
    switch (action.type) {
        case "MLOGIN_SUCCESS":
            //console.log("Verify success");
            sessionStorage.setItem(authConstants.verified, "true");
            return {
                ...state,
                verified: true
            };
        case "MLOGIN_ERROR":
            sessionStorage.setItem(authConstants.verified, "false");
            return {
            };

        default:
            return {};
    }
};

export default verifyReducer;