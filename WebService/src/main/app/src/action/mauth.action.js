
export const mlogin = (credentials) => {
    return (dispatch, getState) => {
        console.log(credentials);
        const {inpMasterpassword, inpKey, inpOption} = credentials;
        // moritz methoden aufruf
        if ( inpMasterpassword === "toast" && inpKey === "toast")
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