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
import Logo from "../../img/logos/LogoV2.svg"
import LoginAuth from "../../authentification/auth.login"
import Alert from "react-bootstrap/Alert";
import { connect } from 'react-redux';
import {login, logout} from "../../action/auth.action";
import {authConstants} from "../../authentification/auth.const.sessionstorage";
import Indicator from "../../network/network.indicator";
import {saveCat, saveTab} from "../../action/dashboard.action";
import tabs from "../dashboard/tabs/tab.enum";
import dashboard from "../dashboard/dashboard";
import ShowIcon from "../../img/icons/password_show_white.svg";
import HideIcon from "../../img/icons/password_hide_white.svg"
import history from "../../routing/history";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import CopyIcon from "../../img/icons/password_copy_white.svg";
import InfoIcon from "../../img/icons/regist_info.svg"
class Registration extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            newPass: "",
            newPassShow: false,
            newPassSec: "",
            newPassSecShow: false,
            newUser: "",

            step: 1,

            error: false,
            missingPassword: false,
            missingSecPassword: false,
            missingUsername: false,
            userAlreadyTaken: false,
            passNoMatch: false,
        };


        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleKeyevent = this.handleKeyevent.bind(this);
        this.printError = this.printError.bind(this);
        this.resetError = this.resetError.bind(this);
        this.exit = this.exit.bind(this);
    }

    handleChange = (e) => {
        this.setState({
            [e.target.id]: e.target.value
        });
        this.resetError(e.target.id, e.target.value);
    };

    resetError( id, value ) {
        if ( value.length > 0 ) {
            switch (id) {
                case "newPass":
                    this.setState({
                        missingPassword: false,
                    });
                    break;
                case "newPassSec":
                    this.setState({
                        missingSecPassword: false,
                    });
                    break;
                case "newUser":
                    this.setState({
                        missingUsername: false,
                    });
                    break;
            }
        }
    }

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
                <Alert.Heading>{StringSelector.getString(this.props.callback.state.language).wrongLoginHeader}</Alert.Heading>
                <p>
                    {StringSelector.getString(this.props.callback.state.language).wrongLogin}
                </p>
            </Alert>
        );
    }

    submit() {
        let err = false;
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
        else {
            // TODO call Kascpers method, check if user already taken
            /*if ( true ) {
                err = true;
                this.setState({
                    userAlreadyTaken: true
                })
            }*/

        }
        if ( this.state.newPass !== this.state.newPassSec ) {
            err = true;
            this.setState({passNoMatch: true});
        }
        else {
            this.setState({
                passNoMatch: false,
            });
        }

        if ( !err )
        {
            this.setState({
                error: false,
                missingPassword: false,
                missingSecPassword: false,
                missingUsername: false,
                passNoMatch: false,
                userAlreadyTaken: true,

                newPass: "",
                newPassSec: "",
                newUser: "",
            });

            // ToDo Kall Kaspers method to check if user regist was succ
            if (false) {
                this.props.callback.switchToRegister(false, true, false);
            } else {
                this.props.callback.switchToRegister(false, false, false);
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
        if ( this.state.missingUsername || this.state.userAlreadyTaken )
        {
            let toAdd;
            if ( !this.state.missingUsername && this.state.userAlreadyTaken ) {
                toAdd = (
                    <a className="text-danger">{StringSelector.getString(this.props.callback.state.language).registUserAlreadyExist}</a>
                );
            }
            return (
                <Form.Group>
                    <Form.Label>
                        {StringSelector.getString(this.props.callback.state.language).registUser}
                        {['right'].map(placement => (
                            <OverlayTrigger
                                key={placement}
                                placement={placement}
                                overlay={
                                    <Tooltip id={`tooltip-${placement}`}>
                                        {StringSelector.getString(this.props.callback.state.language).registUserInfo}
                                    </Tooltip>
                                }
                            >
                                <Button variant="dark" className="infoButton round">
                                    <img
                                        src={InfoIcon}
                                        alt=""
                                        width="14"
                                        height="14"
                                        className="d-inline-block"
                                    />
                                </Button>
                            </OverlayTrigger>
                        ))}
                    </Form.Label>
                    <Form.Control className="is-invalid" type="username" id="newUser" placeholder={StringSelector.getString(this.props.callback.state.language).registUserPlaceholder} value={this.state.newUser}
                                  onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                    {toAdd}
                </Form.Group>
            );
        }
        else
        {
            return (
                <Form.Group>
                    <Form.Label>
                        {StringSelector.getString(this.props.callback.state.language).registUser}
                        {['right'].map(placement => (
                            <OverlayTrigger
                                key={placement}
                                placement={placement}
                                overlay={
                                    <Tooltip id={`tooltip-${placement}`}>
                                        {StringSelector.getString(this.props.callback.state.language).registUserInfo}
                                    </Tooltip>
                                }
                            >
                                <Button variant="dark" className="infoButton round">
                                    <img
                                        src={InfoIcon}
                                        alt=""
                                        width="14"
                                        height="14"
                                        className="d-inline-block"
                                    />
                                </Button>
                            </OverlayTrigger>
                        ))}
                    </Form.Label>
                    <Form.Control type="username" id="newUser" placeholder={StringSelector.getString(this.props.callback.state.language).registUserPlaceholder} value={this.state.newUser}
                                  onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                </Form.Group>
            );
        }
    }

    setPasswordShow( id ) {
        switch (id) {
            // pass
            case 0:
                this.setState({newPassShow: !this.state.newPassShow});
                break;
            // pass sec
            case 1:
                this.setState({newPassSecShow: !this.state.newPassSecShow});
                break;
            // masterpass
            case 2:
                this.setState({newMasterpassShow: !this.state.newMasterpassShow});
                break;
            // masterpass sec
            case 3:
                this.setState({newMasterpassSecShow: !this.state.newMasterpassSecShow});
                break;
        }
    }

    getInputPassword() {
        if ( this.state.missingPassword || this.state.passNoMatch)
        {
            return (
                <Form.Group>
                    <Form.Label className="text-danger" >
                        {StringSelector.getString(this.props.callback.state.language).registPass}
                        {['right'].map(placement => (
                            <OverlayTrigger
                                key={placement}
                                placement={placement}
                                overlay={
                                    <Tooltip id={`tooltip-${placement}`}>
                                        {StringSelector.getString(this.props.callback.state.language).registPassInfo}
                                    </Tooltip>
                                }
                            >
                                <Button variant="dark" className="infoButton round">
                                    <img
                                        src={InfoIcon}
                                        alt=""
                                        width="14"
                                        height="14"
                                        className="d-inline-block"
                                    />
                                </Button>
                            </OverlayTrigger>
                        ))}
                    </Form.Label>
                    <Row className="password-row">
                        { this.state.newPassShow ?
                            <Form.Control className="is-invalid passInp" type="text" id="newPass" placeholder={StringSelector.getString(this.props.callback.state.language).registPassPlaceholder} value={this.state.newPass}
                                          onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                            :
                            <Form.Control className="is-invalid passInp" type="password" id="newPass" placeholder={StringSelector.getString(this.props.callback.state.language).registPassPlaceholder} value={this.state.newPass}
                                          onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                        }

                        <Button variant="dark" className="buttonInline" onClick={() => this.setPasswordShow(0)}>
                            {this.state.newPassShow ?
                                <img
                                    src={HideIcon}
                                    alt=""
                                    width="18"
                                    height="18"
                                    className="d-inline-block"
                                />
                                :
                                <img
                                    src={ShowIcon}
                                    alt=""
                                    width="18"
                                    height="18"
                                    className="d-inline-block"
                                />
                            }
                        </Button>
                    </Row>
                </Form.Group>
            );
        }
        else
        {
            return (
                <Form.Group>
                    <Form.Label>
                        {StringSelector.getString(this.props.callback.state.language).registPass}
                        {['right'].map(placement => (
                            <OverlayTrigger
                                key={placement}
                                placement={placement}
                                overlay={
                                    <Tooltip id={`tooltip-${placement}`}>
                                        {StringSelector.getString(this.props.callback.state.language).registPassInfo}
                                    </Tooltip>
                                }
                            >
                                <Button variant="dark" className="infoButton round">
                                    <img
                                        src={InfoIcon}
                                        alt=""
                                        width="14"
                                        height="14"
                                        className="d-inline-block"
                                    />
                                </Button>
                            </OverlayTrigger>
                        ))}
                    </Form.Label>
                    <Row className="password-row">
                        {this.state.newPassShow ?
                            <Form.Control className="passInp" type="text" id="newPass" placeholder={StringSelector.getString(this.props.callback.state.language).registPassPlaceholder} value={this.state.newPass}
                                          onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                            :
                            <Form.Control className="passInp" type="password" id="newPass" placeholder={StringSelector.getString(this.props.callback.state.language).registPassPlaceholder} value={this.state.newPass}
                                          onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                        }
                        <Button variant="dark" className="buttonInline" onClick={() => this.setPasswordShow(0)}>
                            {this.state.newPassShow ?
                                <img
                                    src={HideIcon}
                                    alt=""
                                    width="18"
                                    height="18"
                                    className="d-inline-block"
                                />
                                :
                                <img
                                    src={ShowIcon}
                                    alt=""
                                    width="18"
                                    height="18"
                                    className="d-inline-block"
                                />
                            }
                        </Button>
                    </Row>
                </Form.Group>
            );
        }
    }

    getInputSecPassword() {
        if ( this.state.missingSecPassword || this.state.passNoMatch )
        {
            let toAdd;
            if ( !this.state.missingSecPassword && this.state.passNoMatch) {
                toAdd = (
                    <a className="text-danger">{StringSelector.getString(this.props.callback.state.language).registPassNotIdent}</a>
                );
            }
            return (
                <Form.Group>
                    <Form.Label className="text-danger">
                        {StringSelector.getString(this.props.callback.state.language).registPassSec}
                    </Form.Label>
                    <Row className="password-row">
                        {this.state.newPassSecShow ?
                            <Form.Control className="is-invalid passInp" type="text" id="newPassSec" placeholder={StringSelector.getString(this.props.callback.state.language).registPassSecPlaceholder} value={this.state.newPassSec}
                                          onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                            :
                            <Form.Control className="is-invalid passInp" type="password" id="newPassSec" placeholder={StringSelector.getString(this.props.callback.state.language).registPassSecPlaceholder} value={this.state.newPassSec}
                                          onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                        }
                        <Button variant="dark" className="buttonInline" onClick={() => this.setPasswordShow(1)}>
                            {this.state.newPassSecShow ?
                                <img
                                    src={HideIcon}
                                    alt=""
                                    width="18"
                                    height="18"
                                    className="d-inline-block"
                                />
                                :
                                <img
                                    src={ShowIcon}
                                    alt=""
                                    width="18"
                                    height="18"
                                    className="d-inline-block"
                                />
                            }
                        </Button>
                    </Row>
                    {toAdd}
                </Form.Group>
            );
        }
        else
        {
            return (
                <Form.Group>
                    <Form.Label>
                        {StringSelector.getString(this.props.callback.state.language).registPassSec}
                    </Form.Label>
                    <Row className="password-row">
                        { this.state.newPassSecShow ?
                            <Form.Control className="passInp" type="text" id="newPassSec" placeholder={StringSelector.getString(this.props.callback.state.language).registPassSecPlaceholder} value={this.state.newPassSec}
                                          onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                            :
                            <Form.Control className="passInp" type="password" id="newPassSec" placeholder={StringSelector.getString(this.props.callback.state.language).registPassSecPlaceholder} value={this.state.newPassSec}
                                          onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                        }
                        <Button variant="dark" className="buttonInline" onClick={() => this.setPasswordShow(1)}>
                            {this.state.newPassSecShow ?
                                <img
                                    src={HideIcon}
                                    alt=""
                                    width="18"
                                    height="18"
                                    className="d-inline-block"
                                />
                                :
                                <img
                                    src={ShowIcon}
                                    alt=""
                                    width="18"
                                    height="18"
                                    className="d-inline-block"
                                />
                            }
                        </Button>
                  </Row>
                </Form.Group>
            );
        }
    }


    /*getInputMasterpass() {
        if ( this.state.missingMasterpassword || this.state.masterpassMatchPass || this.state.masterpassNoMatch)
        {
            return (
                <Form.Group>
                    <Form.Label className="text-danger">
                        {StringSelector.getString(this.props.callback.state.language).registMaster}
                        {['right'].map(placement => (
                            <OverlayTrigger
                                key={placement}
                                placement={placement}
                                overlay={
                                    <Tooltip id={`tooltip-${placement}`}>
                                        {StringSelector.getString(this.props.callback.state.language).registMasterInfo}
                                    </Tooltip>
                                }
                            >
                                <Button variant="dark" className="infoButton round">
                                    <img
                                        src={InfoIcon}
                                        alt=""
                                        width="14"
                                        height="14"
                                        className="d-inline-block"
                                    />
                                </Button>
                            </OverlayTrigger>
                        ))}
                    </Form.Label>
                    <Row className="password-row">
                        { this.state.newMasterpassShow ?
                            <Form.Control className="is-invalid passInp" type="text" id="newMasterpass" placeholder={StringSelector.getString(this.props.callback.state.language).registMasterPlaceholder} value={this.state.newMasterpass}
                                          onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                            :
                            <Form.Control className="is-invalid passInp" type="password" id="newMasterpass" placeholder={StringSelector.getString(this.props.callback.state.language).registMasterPlaceholder} value={this.state.newMasterpass}
                                          onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                        }
                        <Button variant="dark" className="buttonInline" onClick={() => this.setPasswordShow(2)}>
                            {this.state.newMasterpassShow ?
                                <img
                                    src={HideIcon}
                                    alt=""
                                    width="18"
                                    height="18"
                                    className="d-inline-block"
                                />
                                :
                                <img
                                    src={ShowIcon}
                                    alt=""
                                    width="18"
                                    height="18"
                                    className="d-inline-block"
                                />
                            }
                        </Button>
                    </Row>
                </Form.Group>
            );
        }
        else
        {
            return (
                <Form.Group>
                    <Form.Label>
                        {StringSelector.getString(this.props.callback.state.language).registMaster}
                        {['right'].map(placement => (
                            <OverlayTrigger
                                key={placement}
                                placement={placement}
                                overlay={
                                    <Tooltip id={`tooltip-${placement}`}>
                                        {StringSelector.getString(this.props.callback.state.language).registMasterInfo}
                                    </Tooltip>
                                }
                            >
                                <Button variant="dark" className="infoButton round">
                                    <img
                                        src={InfoIcon}
                                        alt=""
                                        width="14"
                                        height="14"
                                        className="d-inline-block"
                                    />
                                </Button>
                            </OverlayTrigger>
                        ))}
                    </Form.Label>
                    <Row className="password-row">
                        { this.state.newMasterpassShow ?
                            <Form.Control className="passInp" type="text" id="newMasterpass" placeholder={StringSelector.getString(this.props.callback.state.language).registMasterPlaceholder} value={this.state.newMasterpass}
                                          onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                            :
                            <Form.Control className="passInp" type="password" id="newMasterpass" placeholder={StringSelector.getString(this.props.callback.state.language).registMasterPlaceholder} value={this.state.newMasterpass}
                                          onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                        }
                        <Button variant="dark" className="buttonInline" onClick={() => this.setPasswordShow(2)}>
                            {this.state.newMasterpassShow ?
                                <img
                                    src={HideIcon}
                                    alt=""
                                    width="18"
                                    height="18"
                                    className="d-inline-block"
                                />
                                :
                                <img
                                    src={ShowIcon}
                                    alt=""
                                    width="18"
                                    height="18"
                                    className="d-inline-block"
                                />
                            }
                        </Button>
                    </Row>
                </Form.Group>
            );
        }
    }*/


    /*getInputMasterpassSec() {
        if ( this.state.missingSecMasterpassword || this.state.masterpassMatchPass || this.state.masterpassNoMatch)
        {
            let toAdd;
            if ( !this.state.missingSecMasterpassword ) {
                if ( this.state.masterpassNoMatch) {
                    toAdd = (
                        <a className="text-danger">{StringSelector.getString(this.props.callback.state.language).registMasterNotIdent}</a>
                    );
                }
                else if ( this.state.masterpassMatchPass )
                {
                    toAdd = (
                        <a className="text-danger">{StringSelector.getString(this.props.callback.state.language).registMasterMatchPass}</a>
                    );
                }
            }
            return (
                <Form.Group>
                    <Form.Label className="text-danger">
                        {StringSelector.getString(this.props.callback.state.language).registMasterSec}
                    </Form.Label>
                        <Row className="password-row">
                        { this.state.newMasterpassSecShow ?
                            <Form.Control className="is-invalid passInp" type="text" id="newMasterpassSec" placeholder={StringSelector.getString(this.props.callback.state.language).registMasterSecPlaceholder} value={this.state.newMasterpassSec}
                                          onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                            :
                            <Form.Control className="is-invalid passInp" type="password" id="newMasterpassSec" placeholder={StringSelector.getString(this.props.callback.state.language).registMasterSecPlaceholder} value={this.state.newMasterpassSec}
                                          onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                        }
                        <Button variant="dark" className="buttonInline" onClick={() => this.setPasswordShow(3)}>
                            {this.state.newMasterpassSecShow ?
                                <img
                                    src={HideIcon}
                                    alt=""
                                    width="18"
                                    height="18"
                                    className="d-inline-block"
                                />
                                :
                                <img
                                    src={ShowIcon}
                                    alt=""
                                    width="18"
                                    height="18"
                                    className="d-inline-block"
                                />
                            }
                        </Button>
                    </Row>
                    {toAdd}
                </Form.Group>
            );
        }
        else
        {
            return (
                <Form.Group>
                    <Form.Label>
                        {StringSelector.getString(this.props.callback.state.language).registMasterSec}
                    </Form.Label>
                        <Row className="password-row">
                        { this.state.newMasterpassSecShow ?
                            <Form.Control className="passInp" type="text" id="newMasterpassSec" placeholder={StringSelector.getString(this.props.callback.state.language).registMasterSecPlaceholder} value={this.state.newMasterpassSec}
                                          onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                            :
                            <Form.Control className="passInp" type="password" id="newMasterpassSec" placeholder={StringSelector.getString(this.props.callback.state.language).registMasterSecPlaceholder} value={this.state.newMasterpassSec}
                                          onKeyDown={this.handleKeyevent} onChange={this.handleChange} />
                        }
                        <Button variant="dark" className="buttonInline" onClick={() => this.setPasswordShow(3)}>
                            {this.state.newMasterpassSecShow ?
                                <img
                                    src={HideIcon}
                                    alt=""
                                    width="18"
                                    height="18"
                                    className="d-inline-block"
                                />
                                :
                                <img
                                    src={ShowIcon}
                                    alt=""
                                    width="18"
                                    height="18"
                                    className="d-inline-block"
                                />
                            }
                        </Button>
                    </Row>
                </Form.Group>
            );
        }
    }*/

    exit() {
        this.props.callback.switchToRegister(false,false,true);
    }


    render() {
        let formOut = (
            <>
                {this.getInputUsername()}
                <hr/>
                {this.getInputPassword()}
                {this.getInputSecPassword()}
            </>
        );

        return (
            <>
                <div className="backgroundPicRegist">
                    <div className="gradientDivLogin">
                        <Container>
                            <Row className="size-hole-window">
                                <Col xs={10} sm={10} md={8} lg={6} className="center-vert center-horz">
                                    <Card className="card-login login">
                                        <div className="close closeButt" onClick={this.exit}>
                                            <span aria-hidden="true">×</span>
                                        </div>
                                        <Card.Img variant="top" src={Logo} className="centerImg"/>
                                        <Card.Body className={"noPaddingTop"}>
                                            <h4>{StringSelector.getString(this.props.callback.state.language).regist}</h4>
                                            <hr/>
                                            <Form autoComplete="off">
                                                {formOut}
                                                <Button variant="danger" className={"float-right"} onClick={this.handleSubmit}>
                                                    {StringSelector.getString(this.props.callback.state.language).registButton}
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
            </>
        );
    }
}

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}


export default Registration;