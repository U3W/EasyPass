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
import {login, logout, saveUser, saveUserState, setSessionUser} from "../../action/auth.action";
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

            networkState: navigator.onLine,

            inpFile: null,
            fileName: "",
            missingFile: false,

            saveUserState: "" + LoginState.getSaveUsernameState(),
        };

        this.fadeOutGradient = animation.fadeOutGradient.bind(this);


        this.handleFile = this.handleFile.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleKeyevent = this.handleKeyevent.bind(this);
        this.printError = this.printError.bind(this);
        this.switchToRegister = this.switchToRegister.bind(this);
        this.handleConnectionChange = this.handleConnectionChange.bind(this);
        this.printRegistered = this.printRegistered.bind(this);
        // Login & Registration Worker calls
        this.workerCall = this.workerCall.bind(this);
        this.loginProcess = this.loginProcess.bind(this);
        this.registrationProcess = this.registrationProcess.bind(this);
        this.delFile = this.delFile.bind(this);

        // reset Dashboard username
        this.props.setSessionUser(null);
    }

    componentDidMount() {
        this.props.worker.addEventListener('message', this.workerCall, true);
        this.props.worker.postMessage(['login', undefined]);
        // end animation thing
        setTimeout(() => {
            this.setState({
                loading: false,
            });
        }, 500);

        window.addEventListener('online', this.handleConnectionChange);
        window.addEventListener('offline', this.handleConnectionChange);
    }

    componentWillUnmount() {
        this.props.worker.removeEventListener('message', this.workerCall, true);
        this.props.worker.postMessage(['unregister', undefined]);

        window.removeEventListener('online', this.handleConnectionChange);
        window.removeEventListener('offline', this.handleConnectionChange);
    }

    workerCall( e ) {
        const cmd = e.data[0];
        const data = e.data[1];
        switch (cmd) {
            case 'login':
                console.log("LOGIN!!!");
                this.props.login(data);
                this.props.setSessionUser(this.state.inpUsername);
                if (LoginAuth.getLoggedIn()) {
                    history.push("/dashboard");
                    LoginAuth.clear();
                } else {
                    // Fehlermeldung
                    this.setState({error: true});
                    this.dismissError();
                }
                break;
        }
    }

    handleConnectionChange() {
        this.setState({
            networkState: navigator.onLine,
        });
    }

    loginProcess(credentials) {
        this.props.worker.postMessage(['login', credentials]);
    }

    registrationProcess(credentials) {

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
        return ext.toLowerCase() === "easykey";
    }




    handleChange = (e) => {
        this.setState({
            [e.target.id]: e.target.value
        });
        if ( e.target.value.length > 0 ) {
            switch ( e.target.id ) {
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
        if ( this.state.missingFile ) {
            err = true;
        }
        if ( !err )
        {
            this.setState({
                missingUsername: false,
                missingPassword: false,
                missingFile: false
            });

            // TODO @Kacper @Seb @Moritz Adapt credentials to final strucuture
            // const {inpPassword, inpUsername, inpMasterpassword, inpKeyFile, inpWebAuhtn} = credentials

            const credentials = {
                uname: this.state.inpUsername,
                passwd: this.state.inpPassword,
                twofa: this.state.inpFile,
            };
            console.log("TWOFA", credentials.twofa);

            this.loginProcess(credentials);
            this.props.saveUser(credentials.uname);
            /**this.props.login(this.state);
            this.props.saveUser(this.state.inpUsername);

            if (LoginAuth.getLoggedIn()) {
                history.push("/dashboard");
            } else {
                // Fehlermeldung
                this.setState({error: true});
                this.dismissError();
            }*/


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

    rigInput() {
        document.getElementById("fakeFileInput").click();
    }

    delFile() {
        this.setState({
            inpFile: null,
            fileName: "",
            missingFile: false,
        })
    }

    getInputFile() {
        let cssClass = "notDisabled";
        if ( this.state.missingFile ) {
            cssClass = "notDisavled is-invalid";
        }

        return (
            <InputGroup className="mb-3">
                <Form.Control disabled={true} className={cssClass} aria-describedby="inputGroup-sizing-default" placeholder={StringSelector.getString(this.state.language).masterpass2FAFileNoFile} value={this.state.fileName}/>
                <input disabled={false} id="fakeFileInput" type="file" name="file" className="hiddenFileInput" accept=".easykey" onChange={this.handleFile}/>
                { (this.state.missingFile || this.state.inpFile !== null) &&
                    <>
                        <Button variant={"dark"} className="fileButton notRound" onClick={this.delFile}>
                            {StringSelector.getString(this.state.language).masterpass2FAFileDel}
                        </Button>
                        <hr className="vertical-button-sep"/>
                    </>
                }
                <Button variant={"dark"} className="fileButton" onClick={this.rigInput}>
                    {StringSelector.getString(this.state.language).masterpass2FAFileSelect}
                </Button>
            </InputGroup>
        );
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
                                                        <h2>{StringSelector.getString(this.state.language).login}</h2>
                                                    </Col>
                                                </Row>
                                                <hr/>
                                                <Form autoComplete="off">
                                                    {this.getInputUsername()}
                                                    {this.getInputPassword()}
                                                    <Row>
                                                        <Col sm={12}>
                                                            <Form.Label>
                                                                {StringSelector.getString(this.state.language).masterpass2FA}
                                                            </Form.Label>
                                                        </Col>
                                                    </Row>
                                                    {this.getInputFile()}
                                                    <hr/>
                                                    <Form.Group>
                                                        { this.state.saveUserState ?
                                                            <Form.Check type="checkbox" id="inpKeepLoggedIn" checked={true} onChange={() => this.setSaveUser(false)} label={StringSelector.getString(this.state.language).rememberUsername} />
                                                            :
                                                            <Form.Check type="checkbox" id="inpKeepLoggedIn" checked={false} onChange={() => this.setSaveUser(true)} label={StringSelector.getString(this.state.language).rememberUsername} />
                                                        }
                                                        { this.state.networkState &&
                                                            <Nav.Link onClick={() => { this.switchToRegister(true, false, true)} }>{StringSelector.getString(this.state.language).registrationButton}</Nav.Link>
                                                        }
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
        saveUserState: (to) => dispatch(saveUserState(to)),
        saveUser: (username) => dispatch(saveUser(username)),
        setSessionUser: (username) => dispatch(setSessionUser(username)),
    }
};

const mapStateToProps = (state) => {
    //console.log(state);
    return{
        loggedIn: state.auth.loggedIn
    }
};

export default connect(mapStateToProps, mapDispatchToProps, null, { pure: false})(Login);