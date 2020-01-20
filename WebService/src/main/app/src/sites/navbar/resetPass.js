import * as React from "react";
import Modal from "react-bootstrap/Modal";
import {Card} from "react-bootstrap";
import Row from "react-bootstrap/Row";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import CopyIcon from "../../img/icons/password_copy_white.svg";
import StringSelector from "../../strings/stings";
import HideIcon from "../../img/icons/password_hide_white.svg";
import ShowIcon from "../../img/icons/password_show_white.svg"
import Alert from "react-bootstrap/Alert";


export default class ResetPass extends React.Component{

    constructor(props) {
        super(props);

        this.state = {
            pass: "",
            passShow: false,
            newPass: "",
            newPassShow: false,
            newPassSec: "",
            newPassSecShow: false,

            missingPass: false,
            missingNewPass: false,
            missingNewPassSec: false,
            newPassMatchPass: false,
            newPassNotSec: false,

            errorText: "Penis",
            errorShow: true,
            errorState: false,
        };

        this.changeListener = this.changeListener.bind(this);
        this.handleKeyevent = this.handleKeyevent.bind(this);
        this.submit = this.submit.bind(this);
    }

    changeListener(e) {
        this.setState({
            [e.target.id]: e.target.value,
        });
        if ( e.target.value.length > 0 ) {
            switch (e.target.id) {
                case "pass":
                    this.setState({
                        missingPass: false,
                    });
                    break;
                case "newPass":
                    this.setState({
                        missingNewPass: false,
                    });
                    break;
                case "newPassSec":
                    this.setState({
                        missingNewPassSec: false,
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

    submit() {
        let error = false;

        if ( this.state.pass.length === 0 ) {
            error = true;
            this.setState({
                missingPass: true,
            });
        }
        if ( this.state.newPass.length === 0 ) {
            error = true;
            this.setState({
                missingNewPass: true,
            });
        }
        if ( this.state.newPassSec.length === 0 ) {
            error = true;
            this.setState({
                missingNewPassSec: true,
            });
        }

        if ( this.state.newPassSec !== this.state.newPass) {
            error = true;
            this.setState({
                newPassNotSec: true,
            })
        }

        if ( this.state.newPass === this.state.pass ) {
            error = true;
            this.setState({
                newPassMatchPass: true,
            });
        }

        if ( !error ) {
            let succ = this.props.callback.resetPass(this.state.pass, this.state.newPass);
            if ( !succ ) {
                this.props.callback.props.callback.setErrorShow(true);
                this.props.callback.props.callback.setErrorState("danger");
                this.props.callback.props.callback.setErrorText("Passwort stimmt nicht mit dem ursprünglichen überein!");
            }
            else {
                this.props.callback.props.callback.setErrorShow(true);
                this.props.callback.props.callback.setErrorState("success");
                this.props.callback.props.callback.setErrorText("Passwort geändert!");
            }
        }
    }

    setPassShow( to ) {
        this.setState({
            passShow: to,
        });
    }

    setNewPassShow( to ) {
        this.setState({
            newPassShow: to,
        });
    }

    setNewPassSecShow( to ) {
        this.setState({
            newPassSecShow: to,
        });
    }

    render() {

        let passClass = "";
        let newPassClass = "";
        let newPassSecClass = "";
        let errText = "";
        let errorClass = "";

        if ( this.state.missingPass) {
            passClass = "is-invalid";
        }
        if ( this.state.missingNewPass ) {
            newPassClass = "is-invalid";
        }
        if ( this.state.missingNewPassSec ) {
            newPassSecClass = "is-invalid";
        }
        if ( this.state.newPassMatchPass) {
            errText = "";
            errorClass = "";
        }
        if ( this.state.newPassNotSec ) {
            errText = "";
            errorClass = "";
        }
        return (
            <>
                <Modal show={this.props.show} onHide={this.props.callback.setChangePopUpDisabled} onKeyDown={this.handleKeyevent} className="ep-modal-dialog">
                    <Modal.Header closeButton>
                        <Modal.Title>Change password</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Card.Body>
                            <Row>
                                <InputGroup size="sm" className="">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="inputGroup-sizing-sm">Password</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    { this.state.passShow ?
                                        <>
                                            <FormControl id="pass" className={passClass} aria-label="Small" aria-describedby="inputGroup-sizing-sm" disabled={false} onChange={this.changeListener} value={this.state.pass} />
                                            <Button variant="dark" className="buttonSpaceInline" onClick={() => this.setPassShow(false)}>
                                                <img
                                                    src={HideIcon}
                                                    alt=""
                                                    width="14"
                                                    height="14"
                                                    className="d-inline-block"
                                                />
                                            </Button>
                                        </>
                                        :
                                        <>
                                            <FormControl id="pass" className={passClass} type="password" aria-label="Small" aria-describedby="inputGroup-sizing-sm" disabled={false} onChange={this.changeListener} value={this.state.pass} />
                                            <Button variant="dark" className="buttonSpaceInline" onClick={() => this.setPassShow(true)}>
                                                <img
                                                    src={ShowIcon}
                                                    alt=""
                                                    width="14"
                                                    height="14"
                                                    className="d-inline-block"
                                                />
                                            </Button>
                                        </>
                                    }

                                </InputGroup>
                            </Row>
                            <hr/>
                            <Row>
                                <InputGroup size="sm" className="mb-3">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="inputGroup-sizing-sm">New password</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    { this.state.newPassShow ?
                                        <>
                                            <FormControl id="newPass" className={newPassClass} aria-label="Small" aria-describedby="inputGroup-sizing-sm" disabled={false} onChange={this.changeListener} value={this.state.newPass} />
                                            <Button variant="dark" className="buttonSpaceInline" onClick={() => this.setNewPassShow(false)}>
                                                <img
                                                    src={HideIcon}
                                                    alt=""
                                                    width="14"
                                                    height="14"
                                                    className="d-inline-block"
                                                />
                                            </Button>
                                        </>
                                        :
                                        <>
                                            <FormControl id="newPass" className={newPassClass} type="password" aria-label="Small" aria-describedby="inputGroup-sizing-sm" disabled={false} onChange={this.changeListener} value={this.state.newPass} />
                                            <Button variant="dark" className="buttonSpaceInline" onClick={() => this.setNewPassShow(true)}>
                                                <img
                                                    src={ShowIcon}
                                                    alt=""
                                                    width="14"
                                                    height="14"
                                                    className="d-inline-block"
                                                />
                                            </Button>
                                        </>
                                    }

                                </InputGroup>
                            </Row>
                            <Row>
                                <InputGroup size="sm" className="mb-3">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="inputGroup-sizing-sm">Repeat new password</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    { this.state.newPassSecShow ?
                                        <>
                                            <FormControl id="newPassSec" className={newPassSecClass} aria-label="Small" aria-describedby="inputGroup-sizing-sm" disabled={false} onChange={this.changeListener} value={this.state.newPassSec} />
                                            <Button variant="dark" className="buttonSpaceInline" onClick={() => this.setNewPassSecShow(false)}>
                                                <img
                                                    src={HideIcon}
                                                    alt=""
                                                    width="14"
                                                    height="14"
                                                    className="d-inline-block"
                                                />
                                            </Button>
                                        </>
                                        :
                                        <>
                                            <FormControl id="newPassSec" className={newPassSecClass} type="password" aria-label="Small" aria-describedby="inputGroup-sizing-sm" disabled={false} onChange={this.changeListener} value={this.state.newPassSec} />
                                            <Button variant="dark" className="buttonSpaceInline" onClick={() => this.setNewPassSecShow(true)}>
                                                <img
                                                    src={ShowIcon}
                                                    alt=""
                                                    width="14"
                                                    height="14"
                                                    className="d-inline-block"
                                                />
                                            </Button>
                                        </>
                                    }

                                </InputGroup>
                            </Row>
                        </Card.Body>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={this.submit}>
                            Change
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }
}