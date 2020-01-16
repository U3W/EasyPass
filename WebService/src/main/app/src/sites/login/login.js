import React from "react";

import "./login.css"
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import history from "../../routing/history";

import dashboardState from "../dashboard/dashboard.saved.state";
// Strings
import StringSelector from "../../strings/stings";

// Rest
import {Card, Nav} from "react-bootstrap";
import Logo from "../../img/logo/LogoV2.svg"
import LoginAuth from "../../authentification/auth.login"
import Alert from "react-bootstrap/Alert";
import { connect } from 'react-redux';
import {login, logout, succRegist} from "../../action/auth.action";
import Indicator from "../../network/network.indicator";
import {dashboardAlerts} from "../dashboard/const/dashboard.enum";
import Registration from "../registration/registration";



//<Row className="justify-content-center">
class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            language: dashboardState.getSelectedLanguage(),

            inpPassword: "",
            inpUsername: "",
            error: false,
            missingPassword: false,
            missingUsername: false,

            wantRegister: false,
            showRegistered: false,
            alertState: "success",
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleKeyevent = this.handleKeyevent.bind(this);
        this.printError = this.printError.bind(this);
        this.switchToRegister = this.switchToRegister.bind(this);

        this.printRegistered = this.printRegistered.bind(this);
    }


    componentDidMount() {
        this.props.worker.addEventListener("message", this.workerCall, true);
    }

    componentWillUnmount() {
        this.props.worker.removeEventListener("message", this.workerCall, true);
    }

    workerCall( e ) {
        const cmd = e.data[0];
        const data = e.data[1];
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

    showRegistAlert( succ ) {
        this.setState({
            showRegistered: true,
            alertState: succ,
        }, () => {
            sleep(4000).then(() => {
                    this.setState({
                        showRegistered: false,
                    })
                }
            );
        });
    }

    printRegistered() {
        const show = this.state.showRegistered;
        let succ = StringSelector.getString(this.state.language).registrationAlertSucc;
        let err = StringSelector.getString(this.state.language).registrationAlertError;
        return (
            <Alert show={show} variant={this.state.alertState} className="center-horz error">
                <p className="center-horz center-vert center-text">
                    {this.state.alertState === "success" ?
                        succ
                        :
                        err
                    }
                </p>
            </Alert>
        );
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
                history.push("/verify");
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
                    <Form.Control className="is-invalid" type="username" id="inpUsername" placeholder={StringSelector.getString(this.state.language).usernamePlaceholder} value={this.state.inpUsername}
                                  onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                </Form.Group>
            );
        }
        else
        {
            return (
                <Form.Group>
                    <Form.Label>{StringSelector.getString(this.state.language).username}</Form.Label>
                    <Form.Control type="username" id="inpUsername" placeholder={StringSelector.getString(this.state.language).usernamePlaceholder} value={this.state.inpUsername}
                                  onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                </Form.Group>
            );
        }
    }

    switchToRegister( want, succ, exit) {
        console.log("Exit", want, succ, exit);
        this.setState({
            wantRegister: want,
        });
        if ( !exit ) {
            if ( !want && succ ) {
                this.showRegistAlert("success");
            }
            else {
                this.showRegistAlert("danger");
            }
        }
    }

    getInputPassword() {
        if ( this.state.missingPassword )
        {
            return (
                <Form.Group>
                    <Form.Label className="text-danger">{StringSelector.getString(this.state.language).password}</Form.Label>
                    <Form.Control className="is-invalid" type="password" id="inpPassword" placeholder={StringSelector.getString(this.state.language).passwordPlaceholder} value={this.state.inpPassword}
                                  onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                </Form.Group>
            );
        }
        else
        {
            return (
                <Form.Group>
                    <Form.Label>{StringSelector.getString(this.state.language).password}</Form.Label>
                    <Form.Control type="password" id="inpPassword" placeholder={StringSelector.getString(this.state.language).passwordPlaceholder} value={this.state.inpPassword}
                                  onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                </Form.Group>
            );
        }
    }


    render() {
        return (
            <>
            { this.state.wantRegister ?
                <Registration callback={this}/>
                :
                <div className="backgroundPicLogin">
                    <div className="gradientDivLogin">
                        <Container>
                            <Row className="size-hole-window">
                                <Col xs={12} sm={8} md={6} lg={5} className="center-vert center-horz">
                                    <Card className="card-login login">
                                        <Card.Img variant="top" src={Logo} />
                                        <Card.Body>
                                            <Form autoComplete="off">
                                                {this.getInputUsername()}
                                                {this.getInputPassword()}
                                                <Form.Group>
                                                        <Form.Check type="checkbox" id="inpKeepLoggedIn" label={StringSelector.getString(this.state.language).keepLoggedIn} />
                                                    <Nav.Link onClick={() => { this.switchToRegister(true, false, true)} }>{StringSelector.getString(this.state.language).registrationButton}</Nav.Link>
                                                </Form.Group>
                                                <Button variant="danger" className={"float-right"} onClick={this.handleSubmit}>
                                                    {StringSelector.getString(this.state.language).loginButton}
                                                </Button>
                                            </Form>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <div className="footer">
                                    {this.printError()}
                                    {this.printRegistered()}
                                </div>
                                <Indicator />
                            </Row>
                        </Container>
                    </div>
                </div>
            }

            </>
        );
    }
}

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

const mapDispatchToProps = (dispatch) => {
    return {
        login: (creds) => dispatch(login(creds)),
        logout: () => dispatch(logout()),
    }
};

const mapStateToProps = (state) => {
    //console.log(state);
    return{
        loggedIn: state.auth.loggedIn
    }
};

export default connect(mapStateToProps, mapDispatchToProps, null, { pure: false})(Login);