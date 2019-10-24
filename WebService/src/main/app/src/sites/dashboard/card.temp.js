import React from "react"
import {Route} from "react-router-dom";
import LoginAuth from "../../authentification/auth.login";
import {Redirect} from "react-router-dom";
import VerifyAuth from "../../authentification/auth.masterpassword";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import "./card.style.css"

// Nach dem machen --> https://www.youtube.com/watch?v=rH9jM-8hAD8
export const PassCard = ({img: img, title: title, user: user, pass: pass, ...rest}) => {
    return (
        <Card className="pass-card">
            <Card.Img variant="top" src={img} />
            <Card.Body>
                <Card.Title>{title}</Card.Title>
                <Card.Text>
                    User: {user}
                </Card.Text>
                <Button variant="primary">Go to Page</Button>
            </Card.Body>
        </Card>
    )
};