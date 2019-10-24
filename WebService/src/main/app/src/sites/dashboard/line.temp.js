import React from "react"
import Route from "react-router-dom/Route";
import LoginAuth from "../../authentification/auth.login";
import Redirect from "react-router-dom/Redirect";
import VerifyAuth from "../../authentification/auth.masterpassword";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import "./card.style.css"

export const PassLine = ({id: id, img: img, title: title, user: user, pass: pass, ...rest}) => {
    return (
        <div className="panel panel-default">
            <div className="panel-heading" data-toggle="collapse" data-parent="#accordion" href="#collapse">
                <h4 className="panel-title">
                    <a>Collapsible Group 1</a>
                </h4>
            </div>
            <div id="collapse1" className="panel-collapse collapse in">
                <div className="panel-body">Lorem ipsum dolor sit amet, consectetur adipisicing elit,
                    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                    quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </div>
            </div>
        </div>
    )
};