import React from "react"
import {Route, Redirect} from "react-router-dom"
import LoginAuth from "../authentification/auth.login"
import VerifyAuth from "../authentification/auth.masterpassword"

export const ProtectedRoute = ({component: Component, type: type, netState: netState, ...rest}) => {
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
                               alert("Jetzt gehts wieder zurück");
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
                       else if ( type === "verify" )
                       {
                           let con;
                           if ( netState === "offline" )
                           {
                               con = VerifyAuth.getVerified();
                           }
                           else
                           {
                               con = LoginAuth.getLoggedIn() && VerifyAuth.getVerified();
                           }
                           if ( con )
                           {
                               return <Component {...props}/>
                           }
                           else
                           {
                               alert("Jetzt gehts wieder zurück: verify");
                               return <Redirect to={
                                   {
                                       pathname: "/verify",
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