import React from "react"
import {Route, Redirect} from "react-router-dom"
import LoginAuth from "../authentification/auth.login"

export const ProtectedRoute = ({component: Component, type: type, ...rest}) => {
    return (
        <Route {...rest}
            render={
                   (props) => {
                       if ( type === "auth" )
                       {
                           if ( LoginAuth.getLoggedIn() )
                           {
                               return <Component {...props}/>
                           }
                           else
                           {
                               return <Redirect to={
                                   {
                                       pathname: "/",
                                       state: {
                                           from: props.location
                                       }
                                   }
                               }/>
                           }
                       }
                    }
            }
        />
    )
};