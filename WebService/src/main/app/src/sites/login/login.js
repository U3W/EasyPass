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

// animatoin
import * as animation from "../../animation/fadeOutGradient"

// Rest
import {Card, Nav} from "react-bootstrap";
import LogoSchlüssel from "../../img/logo/LogoSchnlüsselV2.svg"
import Logo from "../../img/logo/LogoV2.svg"
import LoginAuth from "../../authentification/auth.login"
import Alert from "react-bootstrap/Alert";
import { connect } from 'react-redux';
import {login, logout, save2FA, saveUser, saveUserState} from "../../action/auth.action";
import Indicator from "../../network/network.indicator";
import {dashboardAlerts} from "../dashboard/const/dashboard.enum";
import Registration from "../registration/registration";
import indexState from "../../index.saved.state";
import InputGroup from "react-bootstrap/InputGroup";
import LoginState from "./login.saved.state";



//<Row className="justify-content-center">
class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // for the loading animation
            loading: indexState.getLoadingState(),

            language: dashboardState.getSelectedLanguage(),

            inpPassword: "",
            inpUsername: LoginState.getSavedUsername(),
            error: false,
            missingPassword: false,
            missingUsername: false,

            wantRegister: false,
            showRegistered: false,
            alertState: "success",


            inpMasterpassword: "",

            inpFile: null,
            fileName: "",

            inpRadio: "" + LoginState.getRadioState(),
            saveUserState: "" + LoginState.getSaveUsernameState(),
            missingMasterpassword: false,
            missingFile: false,
        };

        this.fadeOutGradient = animation.fadeOutGradient.bind(this);


        this.handleFile = this.handleFile.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleKeyevent = this.handleKeyevent.bind(this);
        this.printError = this.printError.bind(this);
        this.switchToRegister = this.switchToRegister.bind(this);

        this.printRegistered = this.printRegistered.bind(this);
    }


    handleFile( e ) {
        let file = e.target.files[0];
        if ( file !== undefined ) {
            this.setState({
                missingFile: false,
            });
            if ( this.isKeyFile(file.name) ) {
                this.setState({
                    fileName: file.name,
                    inpFile: file,
                });
            }
            else {
                this.setState({
                    fileName: StringSelector.getString(this.state.language).masterpass2FAFileNotSup,
                    inpFile: null,
                    missingFile: true,
                });
            }
        }
    }

    getExtension(filename) {
        let path = filename.split('.');
        return path[path.length - 1];
    }

    isKeyFile(filename) {
        let ext = this.getExtension(filename);
        return ext.toLowerCase() === "kdbx";
    }


    componentDidMount() {
        this.props.worker.addEventListener("message", this.workerCall, true);
        // end animation thing
        setTimeout(() => {
            this.setState({
                loading: false,
            });
        }, 500)
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
        if ( e.target.value.length > 0 ) {
            switch ( e.target.id ) {
                case "inpMasterpassword":
                    this.setState({
                        missingMasterpassword: false,
                    });
                    break;
                case "inpUsername":
                    this.setState({
                        missingUsername: false,
                    });
                    break;
                case "inpPassword":
                    this.setState({
                        missingPassword: false,
                    });
                    break;
            }

        }
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
        if ( this.state.inpMasterpassword ==="" )
        {
            err = true;
            this.setState({missingMasterpassword: true});
        }
        if ( this.state.inpRadio === "file" )
        {
            if ( this.state.inpFile === null )
            {
                err = true;
                this.setState({missingFile: true });
            }
        }
        if ( !err )
        {
            this.setState({
                missingUsername: false,
                missingPassword: false,
                missingMasterpassword: false,
                missingFile: false
            });

            this.props.login(this.state);
            this.props.saveUser(this.state.inpUsername);

            if (LoginAuth.getLoggedIn()) {
                history.push("/dashboard");
            } else {
                // Fehlermeldung
                this.setState({error: true});
                this.dismissError();
            }


            this.setState({
                inpPassword: "",
                inpUsername: LoginState.getSavedUsername(),
                inpMasterpassword: "",
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
        //console.log("Exit", want, succ, exit);
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


    getInputMasterpassword() {
        if ( this.state.missingMasterpassword )
        {
            return (
                <Form.Group>
                    <Row>
                        <Col sm={12}>
                            <Form.Label className="text-danger">{StringSelector.getString(this.state.language).masterpassword}</Form.Label>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={12}>
                            <Form.Control id="inpMasterpassword" className="is-invalid" type="password" onKeyDown={this.handleKeyevent} onChange={this.handleChange} value={this.state.inpMasterpassword} placeholder={StringSelector.getString(this.state.language).masterpasswordPlace} />
                        </Col>
                    </Row>
                </Form.Group>
            );
        }
        else
        {
            return (
                <Form.Group>
                    <Row>
                        <Col sm={12}>
                            <Form.Label>{StringSelector.getString(this.state.language).masterpassword}</Form.Label>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={12}>
                            <Form.Control id="inpMasterpassword" type="password" onKeyDown={this.handleKeyevent} onChange={this.handleChange} value={this.state.inpMasterpassword} placeholder={StringSelector.getString(this.state.language).masterpasswordPlace} />
                        </Col>
                    </Row>
                </Form.Group>
            );
        }

    }

    getInputAuthn() {
        if ( !(this.state.inpRadio === "authn") )
        {
            return (
                <>

                </>
            );
        }
    }

    rigInput() {
        document.getElementById("fakeFileInput").click();
    }

    getInputFile() {
        if ( this.state.inpRadio === "file" )
        {
            if ( this.state.missingFile ) {
                return (
                    <InputGroup className="mb-3">
                        <Form.Control disabled={true} className="notDisabled is-invalid" aria-describedby="inputGroup-sizing-default" placeholder={StringSelector.getString(this.state.language).masterpass2FAFileNoFile} value={this.state.fileName}/>
                        <input id="fakeFileInput" type="file" name="file" className="hiddenFileInput" accept=".kdbx" onChange={this.handleFile}/>
                        <Button variant={"dark"} className="fileButton" onClick={this.rigInput}>
                            {StringSelector.getString(this.state.language).masterpass2FAFileSelect}
                        </Button>
                    </InputGroup>
                );
            }
            else {
                return (
                    <InputGroup className="mb-3">
                        <Form.Control disabled={true} className="notDisabled" aria-describedby="inputGroup-sizing-default" placeholder={StringSelector.getString(this.state.language).masterpass2FAFileNoFile} value={this.state.fileName}/>
                        <input id="fakeFileInput" type="file" name="file" className="hiddenFileInput" accept=".kdbx" onChange={this.handleFile}/>
                        <Button variant={"dark"} className="fileButton" onClick={this.rigInput}>
                            {StringSelector.getString(this.state.language).masterpass2FAFileSelect}
                        </Button>
                    </InputGroup>
                );
            }
        }
    }

    setRadioState( to ) {
        this.setState({
            inpRadio: to,
        });
        this.props.save2FA(to);
    }

    setSaveUser ( to ) {
        if ( !to ) {
            this.props.saveUser("");
        }
        this.setState({
            saveUserState: to,
        });
        this.props.saveUserState(to);
    }


    getRadioButtons(){
        return (
            <Container>
                {['radio'].map(type => (
                    <Container key={`inline-${type}`} >
                        <Row>
                            <Col sm={12}>
                                { this.state.inpRadio === "authn" ?
                                    <Form.Check onChange={() => this.setRadioState("authn")} inline label={StringSelector.getString(this.state.language).masterpass2FAWebauthn} type={type} id={`inline-${type}-1`} checked={true} />
                                    :
                                    <Form.Check onChange={() => this.setRadioState("authn")} inline label={StringSelector.getString(this.state.language).masterpass2FAWebauthn} type={type} id={`inline-${type}-1`} checked={false}/>
                                }
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={12}>
                                { this.state.inpRadio === "file" ?
                                    <Form.Check onChange={() => this.setRadioState("file")} inline label={StringSelector.getString(this.state.language).masterpass2FAFile} type={type} id={`inline-${type}-3`} checked={true} />
                                    :
                                    <Form.Check onChange={() => this.setRadioState("file")} inline label={StringSelector.getString(this.state.language).masterpass2FAFile} type={type} id={`inline-${type}-3`} checked={false} />
                                }
                            </Col>
                        </Row>
                    </Container>
                ))}
            </Container>
        )
    }


    render() {
        return (
            <>
                { (this.state.loading === undefined ) &&
                    this.fadeOutGradient(true)
                }
                { this.state.wantRegister ?
                    <Registration callback={this}/>
                    :
                    <div className="backgroundPicLogin">
                        <div className="gradientDivLogin">
                            <Container>
                                <Row className="size-hole-window">
                                    <Col xs={12} sm={8} md={6} lg={5} className="center-vert center-horz">
                                        <Card className="card-login login">
                                            <Card.Body>
                                                <Row>
                                                    <img
                                                        alt=""
                                                        src={LogoSchlüssel}
                                                        className="loginLogo"
                                                    />
                                                    <Col>
                                                        <h2>Login</h2>
                                                    </Col>
                                                </Row>
                                                <hr/>
                                                <Form autoComplete="off">
                                                    {this.getInputUsername()}
                                                    {this.getInputPassword()}
                                                    {this.getInputMasterpassword()}
                                                    <Row>
                                                        <Col sm={12}>
                                                            <Form.Label>
                                                                {StringSelector.getString(this.state.language).masterpass2FA}
                                                            </Form.Label>
                                                        </Col>
                                                    </Row>
                                                    {this.getRadioButtons()}

                                                    {this.getInputAuthn()}
                                                    {this.getInputFile()}
                                                    <hr/>
                                                    <Form.Group>
                                                        { this.state.saveUserState ?
                                                            <Form.Check type="checkbox" id="inpKeepLoggedIn" checked={true} onChange={() => this.setSaveUser(false)} label={StringSelector.getString(this.state.language).rememberUsername} />
                                                            :
                                                            <Form.Check type="checkbox" id="inpKeepLoggedIn" checked={false} onChange={() => this.setSaveUser(true)} label={StringSelector.getString(this.state.language).rememberUsername} />
                                                        }
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
                                    <Indicator ref={this.props.callback.ref}/>
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
        save2FA: (option) => dispatch(save2FA(option)),
        saveUserState: (to) => dispatch(saveUserState(to)),
        saveUser: (username) => dispatch(saveUser(username)),
    }
};

const mapStateToProps = (state) => {
    //console.log(state);
    return{
        loggedIn: state.auth.loggedIn
    }
};

export default connect(mapStateToProps, mapDispatchToProps, null, { pure: false})(Login);