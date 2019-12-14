import React from "react";

import "./registration.css"
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import dashboardState from "../dashboard/dashboard.saved.state";
// Strings
import StringSelector from "../../strings/stings";

// Rest
import {Card} from "react-bootstrap";
import Logo from "../../img/logo/LogoV2.svg"
import LoginAuth from "../../authentification/auth.login"
import Alert from "react-bootstrap/Alert";
import { connect } from 'react-redux';
import {login, logout} from "../../action/auth.action";
import {authConstants} from "../../authentification/auth.const.localstorage";
import Indicator from "../../network/network.indicator";
import {saveCat, saveTab} from "../../action/dashboard.action";
import tabs from "../dashboard/tabs/tab.enum";
import dashboard from "../dashboard/dashboard";

class Registration extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            language: dashboardState.getSelectedLanguage(),

            newPass: "",
            newPassSec: "",
            newUser: "",
            newMasterpass: "",
            newMasterpassSec: "",

            step: 1,

            error: false,
            missingPassword: false,
            missingSecPassword: false,
            missingUsername: false,
            missingMasterpassword: false,
            missingMasterpasswordSec: false,
            passNoMatch: false,
            masterpassMatchPass: false,
            masterpassNoMatch: false,
        };


        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleKeyevent = this.handleKeyevent.bind(this);
        this.printError = this.printError.bind(this);
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


    setShow( show ) {
        this.setState({
            error: show
        });
    }

    printError() {
        const show = this.state.error;
        return (
            <Alert show={show} variant="danger" className="center-horz error" dismissible
                   onClose={() => this.setShow(false)}>
                <Alert.Heading>{StringSelector.getString(this.state.language).wrongLoginHeader}</Alert.Heading>
                <p>
                    {StringSelector.getString(this.state.language).wrongLogin}
                </p>
            </Alert>
        );
    }

    submit() {
        let err = false;
        if ( this.state.step === 1 ) {
            // schauen ob leer
            if ( this.state.newPass === "" )
            {
                err = true;
                this.setState({missingPassword: true});
            }
            if ( this.state.newPassSec === "" )
            {
                err = true;
                this.setState({missingSecPassword: true})
            }
            if ( this.state.newUser === "" )
            {
                err = true;
                this.setState({missingUsername: true});
            }
            if ( this.state.newPass === this.state.newPassSec ) {
                err = true;
                this.setState({passNoMath: true});
            }

            if ( !err )
            {
                this.setState({
                    missingUsername: false,
                    missingPassword: false,
                    missingSecPassword: false,
                    step: 2,
                });

                this.props.register(this.state.newPass, this.state.newUser, this.state.newMasterpass);

                if (LoginAuth.getLoggedIn()) {
                    this.props.history.push("/verify");
                } else {
                    // Fehlermeldung
                    this.setState({error: true});
                    this.dismissError();
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
        else {
            if ( this.state.newMasterpass === "" ) {
                err = true;
                this.setState({missingMasterpass: true});
            }
            if ( this.state.newMasterpassSec === "" ) {
                err = true;
                this.setState({missingMasterpassSec: true});
            }
            if ( this.state.newMasterpass === this.state.newPass ) {
                err = true;
                this.setState({masterpasswordMathPass: true});
            }
            if ( this.state.newMasterpass === this.state.newMasterpassSec ) {
                err = true;
                this.setState({masterpasswordNoMath: true})
            }

            if ( !err )
            {
                this.setState({
                    // fehler zurücksetzen
                });


                // ToDo Kall Kaspers method

                if (true) {
                    this.props.history.push("/");
                } else {
                    // Fehlermeldung
                    this.setState({error: true});
                    this.dismissError();
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
    }

    dismissError() {
        sleep(3500).then(() => {
                this.setState({error: false});
            }
        );

    }


    getInputUsername() {
        if ( this.state.missingUsername )
        {
            return (
                <Form.Group>
                    <Form.Label className="text-danger">{StringSelector.getString(this.state.language).username}</Form.Label>
                    <Form.Control className="is-invalid" type="username" id="inpUsername" placeholder={StringSelector.getString(this.state.language).usernamePlaceholder} value={this.state.newUser}
                                  onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                </Form.Group>
            );
        }
        else
        {
            return (
                <Form.Group>
                    <Form.Label>{StringSelector.getString(this.state.language).username}</Form.Label>
                    <Form.Control type="username" id="inpUsername" placeholder={StringSelector.getString(this.state.language).usernamePlaceholder} value={this.state.newUser}
                                  onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                </Form.Group>
            );
        }
    }

    getInputPassword() {
        if ( this.state.missingPassword )
        {
            return (
                <Form.Group>
                    <Form.Label className="text-danger">{StringSelector.getString(this.state.language).password}</Form.Label>
                    <Form.Control className="is-invalid" type="password" id="inpPassword" placeholder={StringSelector.getString(this.state.language).passwordPlaceholder} value={this.state.newPass}
                                  onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                </Form.Group>
            );
        }
        else
        {
            return (
                <Form.Group>
                    <Form.Label>{StringSelector.getString(this.state.language).password}</Form.Label>
                    <Form.Control type="password" id="inpPassword" placeholder={StringSelector.getString(this.state.language).passwordPlaceholder} value={this.state.newPass}
                                  onKeyDown={this.handleKeyevent} onChange={this.handleChange} />

                </Form.Group>
            );
        }
    }

    getInputSecPassword() {
        if ( this.state.missingSecPassword )
        {
            return (
                <Form.Group>
                    <Form.Label className="text-danger">Passwort wiederholen</Form.Label>
                    <Form.Control className="is-invalid" type="password" id="newPass" placeholder={StringSelector.getString(this.state.language).passwordPlaceholder} value={this.state.newPass}
                                  onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                </Form.Group>
            );
        }
        else
        {
            return (
                <Form.Group>
                    <Form.Label>Passwort wiederholen</Form.Label>
                    <Form.Control type="password" id="newPassSec" placeholder={StringSelector.getString(this.state.language).passwordPlaceholder} value={this.state.newPassSec}
                                  onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                </Form.Group>
            );
        }
    }


    getInputMasterpass() {
        if ( this.state.missingMasterpassword )
        {
            return (
                <Form.Group>
                    <Form.Label className="text-danger">Masterpasswort</Form.Label>
                    <Form.Control className="is-invalid" type="password" id="newMasterpass" placeholder={StringSelector.getString(this.state.language).passwordPlaceholder} value={this.state.newMasterpass}
                                  onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                </Form.Group>
            );
        }
        else
        {
            return (
                <Form.Group>
                    <Form.Label>Masterpasswort</Form.Label>
                    <Form.Control type="password" id="inpSecPassword" placeholder={StringSelector.getString(this.state.language).passwordPlaceholder} value={this.state.newMasterpass}
                                  onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                </Form.Group>
            );
        }
    }


    getInputMasterpassSec() {
        if ( this.state.missingMasterpassword )
        {
            return (
                <Form.Group>
                    <Form.Label className="text-danger">Masterpasswort wiederholen</Form.Label>
                    <Form.Control className="is-invalid" type="password" id="newMasterpass" placeholder={StringSelector.getString(this.state.language).passwordPlaceholder} value={this.state.newMasterpassSec}
                                  onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                </Form.Group>
            );
        }
        else
        {
            return (
                <Form.Group>
                    <Form.Label>Masterpasswort wiederholen</Form.Label>
                    <Form.Control type="password" id="inpSecPassword" placeholder={StringSelector.getString(this.state.language).passwordPlaceholder} value={this.state.newMasterpassSec}
                                  onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                </Form.Group>
            );
        }
    }


    render() {
        return (
            <div className="backgroundPicRegist">
                <div className="gradientDivLogin">
                    <Container>
                        <Row className="size-hole-window">
                            <Col xs={11} sm={10} md={10} lg={6} className="center-vert center-horz">
                                <Card className="card-login login">
                                    <Card.Img variant="top" src={Logo} className="centerImg"/>
                                    <Card.Body>
                                        <Form autoComplete="off">
                                            {this.getInputUsername()}
                                            <hr/>
                                            {this.getInputPassword()}
                                            {this.getInputSecPassword()}
                                            Schritt {this.state.step}/2
                                            <Button variant="danger" className={"float-right"} onClick={this.handleSubmit}>
                                                Nächster Schritt
                                            </Button>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <div className="footer">
                                {this.printError()}
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

const mapDispatchToProps4 = (dispatch) => {
    return {
        login: (creds) => dispatch(login(creds)),
    }
};

export default connect(null , mapDispatchToProps4, null, { pure: false})(Registration);