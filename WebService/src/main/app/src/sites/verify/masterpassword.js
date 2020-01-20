import * as React from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import "./masterpassword.css"
import {login, logout} from "../../action/auth.action";

// Strings
import StringSelector from "../../strings/stings";

import {mlogin, mlogout, save2FA} from "../../action/mauth.action";
import {connect} from "react-redux";
import Button from "react-bootstrap/Button";
import VerifyAuth from "../../authentification/auth.masterpassword";
import Alert from "react-bootstrap/Alert";
import Indicator from "../../network/network.indicator";
import tabs from "../dashboard/tabs/tab.enum";
import {saveCat, saveTab} from "../../action/dashboard.action";
import dashboardState from "../dashboard/dashboard.saved.state";
import history from "../../routing/history";
import Back from "../../img/masterpassword_V3.1.svg";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import CopyIcon from "../../img/icons/password_copy_white.svg";
import {dashboardAlerts} from "../dashboard/const/dashboard.enum";

class Masterpassword extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            language: dashboardState.getSelectedLanguage(),

            inpMasterpassword: "",

            inpFile: null,
            fileName: "",

            inpRadio: "" + VerifyAuth.getRadioState(),
            error: false,
            missingMasterpassword: false,
            missingFile: false,
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleKeyevent = this.handleKeyevent.bind(this);
        this.handleRadioButtons = this.handleRadioButtons.bind(this);
        this.handleFile = this.handleFile.bind(this);

        /**
         * Options:
         * - Webauthn (USB-Token)
         * - Keyfile
         */
    }

    componentDidMount() {
        this.props.worker.addEventListener("message", this.workerCall, true);
    }

    componentWillUnmount() {
        this.props.worker.removeEventListener("message", this.workerCall, true);
    }

    handleFile( e ) {
        let file = e.target.files[0];
        console.log("Hold up", file);
        if ( file !== undefined ) {
            this.setState({
                missingFile: false,
            });
            if ( this.isKeyFile(file.name) ) {
                this.setState({
                    fileName: file.name,
                    inpFile: file,
                });
                console.log("True");
            }
            else {
                this.setState({
                    fileName: StringSelector.getString(this.state.language).masterpass2FAFileNotSup,
                    inpFile: null,
                    missingFile: true,
                });
                console.log("False");
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

    workerCall( e ) {
        const cmd = e.data[0];
        const data = e.data[1];
    }

    handleChange = (e) => {
        this.setState({
            [e.target.id]: e.target.value
        });
        if ( e.target.value.length > 0 ) {
            this.setState({
                missingMasterpassword: false,
            });
        }
    };

    handleSubmit( event ) {
        event.preventDefault();
        this.submit();

    }
    handleKeyevent(event) {
        if (event.keyCode === 13 )
        {
            // Enter
            this.submit()
        }
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
                <Alert.Heading>{StringSelector.getString(this.state.language).masterpassWrongLoginHeader}</Alert.Heading>
                <p>
                    {StringSelector.getString(this.state.language).masterpassWrongLogin}
                </p>
            </Alert>
        );
    }

    handleRadioButtons(event) {

    }

    submit() {
        let err = false;
        // schauen ob leer
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
                missingMasterpassword: false,
                missingFile: false
            });


            this.props.mlogin(this.state);
            // reset state from dashboard
            //this.props.saveTab(tabs.PRIVPASS);
            //this.props.saveCat(tabs.PRIVPASS, tabs.ALLCAT);
            //this.props.saveCat(tabs.GROUPPASS, tabs.ALLCAT);

            if ( VerifyAuth.getVerified() )
            {
                history.push("/dashboard");
            }
            else
            {
                // Fehlermeldung
                this.setState({error: true});
                this.dismissError()
            }


            this.setState({
                inpMasterpassword: "",
                inpKey: "",
                inpFile: "",
            })
        }
        else
        {
            this.render()
        }
    }

    dismissError() {
        sleep(3500).then(() => {
                this.setState({error: false});
            }
        );

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

    // TODO input für das Keyfile schreiben
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

    getRadioButtons(){
        // TODO darauf achten welche Verfahren überhaupt möglich sind
        return (
            <Container>
                {['radio'].map(type => (
                    <Container key={`inline-${type}`} >
                        <Row>
                            <Col sm={12}>
                                { this.state.inpRadio === "authn" ?
                                    <Form.Check onChange={() => this.setRadioState("authn")} inline label={StringSelector.getString(this.state.language).masterpass2FAWebauthn} type={type} id={`inline-${type}-1`} name="RadGroup" checked={true} />
                                    :
                                    <Form.Check onChange={() => this.setRadioState("authn")} inline label={StringSelector.getString(this.state.language).masterpass2FAWebauthn} type={type} id={`inline-${type}-1`} name="RadGroup" checked={false}/>
                                }
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={12}>
                                { this.state.inpRadio === "file" ?
                                    <Form.Check onChange={() => this.setRadioState("file")} inline label={StringSelector.getString(this.state.language).masterpass2FAFile} type={type} id={`inline-${type}-3`} name="RadGroup" checked={true} />
                                    :
                                    <Form.Check onChange={() => this.setRadioState("file")} inline label={StringSelector.getString(this.state.language).masterpass2FAFile} type={type} id={`inline-${type}-3`} name="RadGroup" checked={false} />
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
            <div className="">
                <div className="gradientDivMasterpassword">
                    <Container>
                        <Row className="size-hole-window">
                            <Col xs={12} sm={8} md={6} lg={5} className="center-vert center-horz">
                                <img
                                    src={Back}
                                    alt=""
                                    className="masterpassBackgound"
                                />
                                <Card className="card-login">
                                    <Card.Body>
                                        <Form autoComplete="off">
                                            {this.getInputMasterpassword()}
                                            <Form.Group>
                                                <Row>
                                                    <Col sm={12}>
                                                        <Form.Label>
                                                            {StringSelector.getString(this.state.language).masterpass2FA}
                                                        </Form.Label>
                                                    </Col>
                                                </Row>
                                                {this.getRadioButtons()}
                                            </Form.Group>

                                            {this.getInputAuthn()}
                                            {this.getInputFile()}

                                            <Row>
                                                <Col sm={12}>
                                                    <Button className={"float-right"} variant="primary" onClick={this.handleSubmit}>
                                                        {StringSelector.getString(this.state.language).loginButton}
                                                    </Button>
                                                </Col>
                                            </Row>
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

export function PrintError({caller: ob}) {
    if ( ob.state.error )
    {
        return (
            <Alert variant="danger" className="center-horz error" onClick={ob.dismissError(ob)}>
                <Alert.Heading>Test</Alert.Heading>
                <p>
                    Test
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

const mapDispatchToProps1 = (dispatch) => {
    return {
        mlogin: (creds) => dispatch(mlogin(creds)),
        mlogout: () => dispatch(mlogout()),
        save2FA: (option) => dispatch(save2FA(option)),
    }
};

const mapStateToProps1 = (state) => {
    //console.log(state);
    return{
        verified: state.verify.verified
    }
};

export default connect(mapStateToProps1, mapDispatchToProps1, null, { pure: false})(Masterpassword);