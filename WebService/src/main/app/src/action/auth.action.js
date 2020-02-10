
export const login = (credentials) => {
    return (dispatch, getState) => {
        //console.log(credentials);
        const {inpPassword, inpUsername} = credentials;
        // kacper methoden aufruf
        if ( inpUsername === "test" && inpPassword === "test")
        {
            dispatch({type: "LOGIN_SUCCESS"})
        }
        else
        {
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