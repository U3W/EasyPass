import {SAVE_LANGUAGE} from "./dashboard.action";

export const SAVE_MAUTH_STATE = "SAVE_MAUTH_STATE";

export const mlogin = (credentials) => {
    return (dispatch, getState) => {
        //console.log(credentials);
        const {inpMasterpassword, inpFile, inpOption} = credentials;
        // ToDo call morith method
        if ( inpMasterpassword === "toast" && inpFile != null)
        {
            dispatch({type: "MLOGIN_SUCCESS"})
        }
        else
        {
            dispatch({type: "MLOGIN_ERROR"})
        }
    }
};

// TODO Überlegen ob man beim Masterpasswort ein Logout braucht
export const mlogout = () => {
    return (dispatch, getState) => {
        dispatch({type: "MLOGOUT_SUCCESS"})
    }
};

export const save2FA = (twoFactorOpt) => ({
    type: SAVE_MAUTH_STATE,
    twoFactorOpt,
});

