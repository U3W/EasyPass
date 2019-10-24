import React from "react";

import "./login.css"
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

// Strings
import { username } from "../../strings/stings";
import { usernamePlaceholder } from "../../strings/stings";

import { password } from "../../strings/stings";
import { passwordPlaceholder } from "../../strings/stings";

import { keepLoggedIn } from "../../strings/stings";
import { loginButton } from "../../strings/stings";

import { wrongLogin } from "../../strings/stings";
import { wrongLoginHeader } from "../../strings/stings";

// Rest
import {Card} from "react-bootstrap";
import Logo from "../../img/logo/LogoV2.svg"
import LoginAuth from "../../authentification/auth.login"
import Alert from "react-bootstrap/Alert";
import { connect } from 'react-redux';
import {login, logout} from "../../action/auth.action";
import {authConstants} from "../../authentification/auth.const.localstorage";
import Indicator from "../../network/network.indicator";

//<Row className="justify-content-center">
class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            inpPassword: "",
            inpUsername: "",
            error: false,
            missingPassword: false,
            missingUsername: false
        };


        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleKeyevent = this.handleKeyevent.bind(this);
    }

    handleChange = (e) => {
        this.setState({
            [e.target.id]: e.target.value
        });
    };

    handleKeyevent(event) {
        if (event.keyCode === 13 )
        {
            // Enter
            this.submit()
        }
    }

    handleSubmit(event) {
        event.preventDefault();

        this.submit();
    }

    submit() {
        let err = false;
        // schauen ob leer
        if ( this.state.inpPassword === "" )
        {
            err = true;
            this.setState({missingPassword: true});
        }
        if ( this.state.inpUsername === "" )
        {
            err = true;
            this.setState({missingUsername: true });
        }
        if ( !err )
        {
            this.setState({missingUsername: false });
            this.setState({missingPassword: false });

            this.props.login(this.state);


            if (LoginAuth.getLoggedIn()) {
                this.props.history.push("/verify");
            } else {
                // Fehlermeldung
                this.setState({error: true});
            }


            this.setState({
                inpPassword: "",
                inpUsername: ""
            })
        }
        else
        {
            this.render();
        }
    }

    dismissError( ob ) {
        sleep(3500).then(() => {
                this.setState({error: false});
            }
        );

    }


    getInputUsername() {
        if ( this.state.missingUsername )
        {
            return (
                <Form.Group controlId="formBasicEmail">
                    <Form.Label className="text-danger">{username}</Form.Label>
                    <Form.Control className="is-invalid" type="username" id="inpUsername" placeholder={usernamePlaceholder} value={this.state.inpUsername}
                                  onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                </Form.Group>
            );
        }
        else
        {
            return (
                <Form.Group controlId="formBasicEmail">
                    <Form.Label>{username}</Form.Label>
                    <Form.Control type="username" id="inpUsername" placeholder={usernamePlaceholder} value={this.state.inpUsername}
                                  onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                </Form.Group>
            );
        }
    }

    getInputPassword() {
        if ( this.state.missingPassword )
        {
            return (
                <Form.Group controlId="formBasicPassword">
                    <Form.Label className="text-danger">{password}</Form.Label>
                    <Form.Control className="is-invalid" type="password" id="inpPassword" placeholder={passwordPlaceholder} value={this.state.inpPassword}
                                  onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                </Form.Group>
            );
        }
        else
        {
            return (
                <Form.Group controlId="formBasicPassword">
                    <Form.Label>{password}</Form.Label>
                    <Form.Control type="password" id="inpPassword" placeholder={passwordPlaceholder} value={this.state.inpPassword}
                                  onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                </Form.Group>
            );
        }
    }


    render() {
        return (
            <div className="backgroundPicLogin">
                <div className="gradientDivLogin">
                    <Container>
                        <Row className="size-hole-window">
                            <Col xs={9} sm={8} md={6} lg={5} className="center-vert center-horz card-login">
                                <Card className="card-login">
                                    <Card.Img variant="top" src={Logo} />
                                    <Card.Body>
                                        <Form>
                                            {this.getInputUsername()}
                                            {this.getInputPassword()}
                                            <Form.Group controlId="formBasicCheckbox">
                                                <Form.Check type="checkbox" id="inpKeepLoggedIn" label={keepLoggedIn} />
                                            </Form.Group>
                                            <Button variant="danger" className={"float-right"} onClick={this.handleSubmit}>
                                            {loginButton}
                                            </Button>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <div className="footer">
                                <PrintError caller={this}/>
                            </div>
                            <Indicator />
                        </Row>
                    </Container>
                </div>
            </div>
        );
    }
}

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

export function PrintError({caller: ob}) {
    if ( ob.state.error )
    {
        return (
            <Alert variant="danger" className="center-horz error" onClick={ob.dismissError(ob)}>
                <Alert.Heading>{wrongLoginHeader}</Alert.Heading>
                <p>
                    {wrongLogin}
                </p>
            </Alert>
        );
    }
    else
    {
        return (
            <p>&nbsp;</p>
        );
    }

}

const mapDispatchToProps = (dispatch) => {
    return {
        login: (creds) => dispatch(login(creds)),
        logout: () => dispatch(logout())
    }
};

const mapStateToProps = (state) => {
    console.log(state);
    return{
        loggedIn: state.auth.loggedIn
    }
};

export default connect(mapStateToProps, mapDispatchToProps, null, { pure: false})(Login);