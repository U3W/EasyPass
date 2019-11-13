import React from "react"
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import "./line.style.css"
import Accordion from "react-bootstrap/Accordion";
import Col from "react-bootstrap/Col";
import Logo from "../../img/logo/LogoSchnlüsselV2.svg";
import Row from "react-bootstrap/Row";
import {Container} from "react-bootstrap";

/**
 * @param id: which element in a list f.e. (must be unique, because with this id the collapsible div will be opened then toggled)
 * @param img: a link to the website (f.e. "www.google.com/"). Note that the / at the end is necessary for getting the favicon (Icon on the beginning of the card)
 * @param title: title of this password
 * @param user: username of this password
 * @param pass: password
 * @param url: link to the login page
 * @param rest
 */
export const PassLine = ({id: id, img: img, title: title, user: user, pass: pass, url: url, ...rest}) => {
    /* <input type="hidden" value={title}/>: Must be at the first position, otherwise the search function wont find it -> exception */
    return(
        <Card className="pass-card" name="passCard">
            <input type="hidden" value={title}/>
            <Accordion.Toggle as={Card.Header} className="clickable center-vert" eventKey={id}>
                <Row>
                    <Col sm={1} md={1} lg={1} xs={1} className="">
                        <img
                            src={img + "favicon.ico"}
                            alt=""
                            width="24"
                            height="24"
                            className="d-inline-block"
                        />
                    </Col>
                    <Col sm={10} md={10} lg={10} xs={10} className="">
                        <Row className="no-padding ">
                            <Col>
                                <h5 className="inline">{title}</h5>
                                <div className="username inline">
                                    {user}
                                </div>
                            </Col>
                            <Col>

                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Accordion.Toggle>
            <div className="center-vert setButtonsRight">
                <Button variant="dark" className="buttonSpace">Dark</Button>
                <Button variant="dark" className="buttonSpace">Dark</Button>
            </div>
            <Accordion.Collapse eventKey={id}>
                <Card.Body>
                    <Row>
                        <h4>{title}</h4>
                        User: {user} <br/>
                        Password: {pass}
                    </Row>
                </Card.Body>
            </Accordion.Collapse>
        </Card>
    )
};