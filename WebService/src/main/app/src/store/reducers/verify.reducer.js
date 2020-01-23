import {authConstants} from "../../authentification/auth.const.localstorage";

const initState = {

};

const verifyReducer = ( state = initState, action) => {
    switch (action.type) {
        case "MLOGIN_SUCCESS":
            //console.log("Verify success");
            localStorage.setItem(authConstants.verified, "true");
            return {
                ...state,
                verified: true
            };
        case "MLOGIN_ERROR":
            localStorage.setItem(authConstants.verified, "false");
            return {
            };

        default:
            return {};
    }
};

export default verifyReducer;