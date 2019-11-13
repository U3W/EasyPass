import React from "react"
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import "./card.style.css"

// Nach dem machen --> https://www.youtube.com/watch?v=rH9jM-8hAD8
/**
 * @param id: which element in a list f.e. (must be unique, because with this id the collapsible div will be opened then toggled)
 * @param img: a link to the website (f.e. "www.google.com/"). Note that the / at the end is necessary for getting the favicon (Icon on the beginning of the card)
 * @param title: title of this password
 * @param user: username of this password
 * @param pass: password
 * @param rest
 */
export const PassCard = ({img: img, title: title, user: user, pass: pass, ...rest}) => {
    /* <input type="hidden" value={title}/>: Must be at the first position, otherwise the search function wont find it -> exception */
    return (
        <Card className="pass-card">
            <input type="hidden" value={title}/>
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