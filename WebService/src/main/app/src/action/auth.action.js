export const SAVE_USER = "SAVE_USER";
export const SAVE_USERNAME = "SAVE_USERNAME";
export const SAVE_SESSIONUSER = "SAVE_SESSIONUSER";

export const login = (status) => {
    return (dispatch, getState) => {
        /**
        console.log(credentials);
        const {inpPassword, inpUsername, inpMasterpassword, inpKeyFile, inpWebAuhtn} = credentials;
        // ToDo call morith method
        // TODO this makes problems with login with webauthn
        if ( inpUsername === "test" && inpPassword === "test" && inpMasterpassword === "toast" )
        {
            dispatch({type: "LOGIN_SUCCESS"})
        }
        else
        {
            dispatch({type: "LOGIN_ERROR"})
        }*/
        if (status) {
            dispatch({type: "LOGIN_SUCCESS"})
        } else {
            dispatch({type: "LOGIN_ERROR"})
        }
    }
};

export const logout = () => {
    return (dispatch, getState) => {
        //console.log("Logging out");
        dispatch({type: "LOGOUT_SUCCESS"})
    }
};

export const saveUserState = ( user ) => ({
    type: SAVE_USER,
    user,
});

export const saveUser = ( username ) => ({
    type: SAVE_USERNAME,
    username,
});

export const setSessionUser = ( username ) => ({
    type: SAVE_SESSIONUSER,
    username
})

