import * as React from "react";
import Modal from "react-bootstrap/Modal";
import {Card, Col, Form} from "react-bootstrap";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";

// Icons
import ReloadPass from "../../img/icons/generate_reload_white.svg";
import StringSelector from "../../strings/stings";

/**
 * The callback needs the following methods:
 * - dismissGeneratePass()
 * - addPassword( pass )
 */
export default class GeneratePass extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            generatedPass: "",
            generatePassLength: 10,
            specialChar: true,
            lowerCaseOnly: false,
            numbers: true,
        }

    }

    componentDidMount() {
        this.generatePass();
    }


    changeGenPass = (e) => {
        this.setState({
            generatedPass: e.target.value,
        });
    };

    changeGenLen = (e) => {
        this.setState({
            generatePassLength: e.target.value
        }, () => this.generatePass());
    };

    changeGenSettings = (e) => {
        switch (e.target.id) {
            case "smallcapsCheck":
                this.setState({
                    lowerCaseOnly: !this.state.lowerCaseOnly,
                },() => this.generatePass());
                break;
            case "specialCheck":
                this.setState({
                    specialChar: !this.state.specialChar,
                },() => this.generatePass());
                break;
            case "numberCheck":
                this.setState({
                    numbers: !this.state.numbers,
                },() => this.generatePass());
                break;
        }

    };


    generatePass() {
        let passwordChars = "abcdefghijklmnopqrstuvwxyz";
        let nummers = "0123456789";
        let special = "#@!%&()/";
        let capLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if ( !this.state.lowerCaseOnly ) {
            passwordChars += capLetters;
        }
        if ( this.state.specialChar) {
            passwordChars += special;
        }
        if ( this.state.numbers ) {
            passwordChars += nummers;
        }
        let randPassword = "";
        for (let i=0; i< this.state.generatePassLength; i++) {
            let rnum = Math.floor(Math.random() * passwordChars.length);
            randPassword += passwordChars.substring(rnum,rnum+1);
        }
        //console.log("Rand2", randPassword);
        //let randPassword = charArray.map(function(x) { return x[Math.floor(Math.random() * x.length)] });
        this.setState({
            generatedPass: randPassword,
        });
    }

    render() {
        return (
            <Modal show={this.props.show} onHide={this.props.callback.dismissGeneratePass} className="ep-modal-dialog">
                <Modal.Header closeButton>
                    <Modal.Title>{StringSelector.getString(this.props.language).addPassGen}:</Modal.Title>
                </Modal.Header>
                <Modal.Body className="ep-modal-body">
                    <Card.Body>
                        <InputGroup size="sm" className="mb-3 editCat">
                            <InputGroup.Prepend>
                                <InputGroup.Text>{StringSelector.getString(this.props.language).addPassPass}</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl autoComplete="off" aria-label="Small" className="nav-link" role="button" value={this.state.generatedPass} onChange={this.changeGenPass} aria-describedby="inputGroup-sizing-sm"/>
                            <InputGroup.Append>
                                <Button variant="dark" className="buttonSpaceInline" onClick={() => this.generatePass()} >
                                    <img
                                        src={ReloadPass}
                                        alt=""
                                        width="14"
                                        height="14"
                                        className="d-inline-block"
                                    />
                                </Button>
                            </InputGroup.Append>
                        </InputGroup>
                        <InputGroup size="sm" className="mb-3 editCat">
                            <InputGroup.Prepend>
                                <InputGroup.Text>{StringSelector.getString(this.props.language).addPassGenLen}</InputGroup.Text>
                            </InputGroup.Prepend>
                            <input type="range" className="custom-range nav-link form-control" min="1" max="32" step="1" value={this.state.generatePassLength} onChange={this.changeGenLen} />
                            <InputGroup.Append>
                                <InputGroup.Text>{this.state.generatePassLength} {StringSelector.getString(this.props.language).addPassGenChar}</InputGroup.Text>
                            </InputGroup.Append>
                        </InputGroup>
                        <Row>
                            <Col xs={6}>
                                <Form.Group>
                                    { this.state.lowerCaseOnly ?
                                        <Form.Check
                                            custom
                                            checked
                                            name="smallCaps"
                                            label={StringSelector.getString(this.props.language).addPassGenSmall}
                                            id="smallcapsCheck"
                                            className="clickableBox"
                                            onChange={this.changeGenSettings}
                                        />
                                        :
                                        <Form.Check
                                            custom
                                            name="smallCaps"
                                            label={StringSelector.getString(this.props.language).addPassGenSmall}
                                            id="smallcapsCheck"
                                            className="clickableBox"
                                            onChange={this.changeGenSettings}
                                        />
                                    }

                                </Form.Group>
                            </Col>
                            <Col xs={6}>
                                <Form.Group>
                                    { this.state.specialChar ?
                                        <Form.Check
                                            custom
                                            checked
                                            name="specialChar"
                                            label={StringSelector.getString(this.props.language).addPassGenSpec}
                                            id="specialCheck"
                                            className="clickableBox"
                                            onChange={this.changeGenSettings}
                                        />
                                        :
                                        <Form.Check
                                            custom
                                            name="specialChar"
                                            label={StringSelector.getString(this.props.language).addPassGenSpec}
                                            id="specialCheck"
                                            className="clickableBox"
                                            onChange={this.changeGenSettings}
                                        />
                                    }

                                </Form.Group>
                            </Col>
                            <Col xs={12}>
                                <Form.Group>
                                    { this.state.numbers ?
                                        <Form.Check
                                            custom
                                            checked
                                            name="numbers"
                                            label={StringSelector.getString(this.props.language).addPassGenNum}
                                            id="numberCheck"
                                            className="clickableBox"
                                            onChange={this.changeGenSettings}
                                        />
                                        :
                                        <Form.Check
                                            custom
                                            name="numbers"
                                            label={StringSelector.getString(this.props.language).addPassGenNum}
                                            id="numberCheck"
                                            className="clickableBox"
                                            onChange={this.changeGenSettings}
                                        />
                                    }

                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant={"danger"} onClick={() => this.props.callback.addPassword(this.state.generatedPass)}>{StringSelector.getString(this.props.language).addPassGenAdd}</Button>
                </Modal.Footer>
            </Modal>
        );
    }

}