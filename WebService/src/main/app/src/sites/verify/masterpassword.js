import * as React from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import "./masterpassword.css"
import {login, logout} from "../../action/auth.action";
import {loginButton, masterpassword, wrongLogin, wrongLoginHeader} from "../../strings/stings";

import {mlogin, mlogout} from "../../action/mauth.action";
import {connect} from "react-redux";
import Button from "react-bootstrap/Button";
import VerifyAuth from "../../authentification/auth.masterpassword";
import Alert from "react-bootstrap/Alert";
import Indicator from "../../network/network.indicator";
import tabs from "../dashboard/tabs/tab.enum";
import {saveCat, saveTab} from "../../action/dashboard.action";

class Masterpassword extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            inpMasterpassword: "",
            inpKey: "",
            inpFile: "",
            inpRadio: "",
            error: false,
            missingMasterpassword: false,
            missingFile: false,
            missingKey: false
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleKeyevent = this.handleKeyevent.bind(this);
        this.handleRadioButtons = this.handleRadioButtons.bind(this);
    }

    handleChange = (e) => {
        this.setState({
            [e.target.id]: e.target.value
        });
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
                <Alert.Heading>{wrongLoginHeader}</Alert.Heading>
                <p>
                    {wrongLogin}
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
            if ( this.state.inpFile === "" )
            {
                err = true;
                this.setState({missingFile: true });
            }
        }
        else
        {
            if ( this.state.inpKey === "" )
            {
                err = true;
                this.setState({missingKey: true });
            }
        }

        if ( !err )
        {
            this.setState({
                missingMasterpassword: false,
                missingKey: false,
                missingFile: false
            });


            this.props.mlogin(this.state);
            // reset state from dashboard
            this.props.saveTab(tabs.PRIVPASS);
            this.props.saveCat(tabs.PRIVPASS, tabs.ALLCAT);
            this.props.saveCat(tabs.GROUPPASS, tabs.ALLCAT);

            if ( VerifyAuth.getVerified() )
            {
                this.props.history.push("/dashboard");
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
                            <Form.Label className="text-danger">Masterpasswort</Form.Label>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={12}>
                            <Form.Control id="inpMasterpassword" className="is-invalid" type="password" onKeyDown={this.handleKeyevent} onChange={this.handleChange} value={this.state.inpMasterpassword} placeholder="Masterpasswort" />
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
                            <Form.Label>Masterpasswort</Form.Label>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={12}>
                            <Form.Control id="inpMasterpassword" type="password" onKeyDown={this.handleKeyevent} onChange={this.handleChange} value={this.state.inpMasterpassword} placeholder="Masterpasswort" />
                        </Col>
                    </Row>
                </Form.Group>
            );
        }

    }

    getInputKey() {
        if ( !(this.state.inpRadio === "file") )
        {
            if ( this.state.missingKey)
            {
                return (
                    <Form.Group>
                        <Row>
                            <Col sm={12}>
                                <Form.Label className="text-danger">Key</Form.Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={12}>
                                <Form.Control id="inpKey" className="is-invalid" type="password" onKeyDown={this.handleKeyevent} value={this.state.inpKey} onChange={this.handleChange} placeholder="Key"/>
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
                                <Form.Label>
                                    Key
                                </Form.Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={12}>
                                <Form.Control id="inpKey" type="password" onKeyDown={this.handleKeyevent} onChange={this.handleChange} value={this.state.inpKey} placeholder="Key"/>
                            </Col>
                        </Row>
                    </Form.Group>
                );
            }
        }
    }

    // TODO input für das Keyfile schreiben
    getInputFile() {
        if ( this.state.inpRadio === "file" )
        {
            return (
                <input type="file"
                       id="avatar" name="avatar"
                       accept="image/png, image/jpeg"/>
            );
        }
    }

    getRadioButtons(){
        // TODO darauf achten welche Verfahren überhaupt möglich sind
        return (
            <Container>
                {['radio'].map(type => (
                    <Container key={`inline-${type}`} >
                        <Row>
                            <Col sm={12}>
                                <Form.Check inline label="Key-Liste" type={type} id={`inline-${type}-1`} name="RadGroup" />
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={12}>
                                <Form.Check inline label="Hardwaretoken" type={type} id={`inline-${type}-2`} name="RadGroup" />
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={12}>
                                <Form.Check inline label="Keyfile" type={type} id={`inline-${type}-3`} name="RadGroup" />
                            </Col>
                        </Row>
                    </Container>
                ))}
            </Container>
        )
    }
    render() {
        return (
            <div className="backgroundPicMasterpassword">
                <div className="gradientDivMasterpassword">
                    <Container>
                        <Row className="size-hole-window">
                            <Col xs={9} sm={8} md={6} lg={5} className="center-vert center-horz">
                                <Card className="card-login">
                                    <Card.Body>
                                        <Form autoComplete="off">
                                            {this.getInputMasterpassword()}
                                            <Form.Group>
                                                <Row>
                                                    <Col sm={12}>
                                                        <Form.Label>
                                                            2-Faktor-Option
                                                        </Form.Label>
                                                    </Col>
                                                </Row>
                                                {this.getRadioButtons()}
                                            </Form.Group>

                                            {this.getInputKey()}
                                            {this.getInputFile()}

                                            <Row>
                                                <Col sm={12}>
                                                    <Button className={"float-right"} variant="primary" onClick={this.handleSubmit}>
                                                        {loginButton}
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
        saveTab: (tabselected) => dispatch(saveTab(tabselected)),
        saveCat: (tabselected, catselected) => dispatch(saveCat(tabselected, catselected))
    }
};

const mapStateToProps1 = (state) => {
    console.log(state);
    return{
        verified: state.verify.verified
    }
};

export default connect(mapStateToProps1, mapDispatchToProps1, null, { pure: false})(Masterpassword);