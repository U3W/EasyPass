import React from "react";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import GeneratePassIcon from "../../img/icons/generate_password_white.svg";
import {Card} from "react-bootstrap";
import StringSelector from "../../strings/stings";

export default class AddCategory extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            name: "",
            description: "",

            missingName: false,
        };

        this.dismissPopUp = this.dismissPopUp.bind(this);
        this.resetState = this.resetState.bind(this);

        this.addCat = this.addCat.bind(this);
        this.handleKeyevent = this.handleKeyevent.bind(this);
    }

    changeInput = (e) => {
        this.setState({
            [e.target.id]: e.target.value,
        }, () => { if ( this.state.name.length > 0 ) { this.setState({ missingName: false}) }})


    };


    handleKeyevent(event) {
        if (event.keyCode === 13 )
        {
            // Enter
            this.addCat()
        }
    }

    addCat() {
        if ( this.state.name.length > 0 ) {
            this.props.callback.addCat(this.state.name, this.state.description);
            this.resetState();
        }
        else {
            // Error
            this.setState({
                missingName: true,
            });
        }
    }

    dismissPopUp() {
        this.resetState();
        this.props.callback.dismissAddCat();
    }

    resetState() {
        this.setState({
            name: "",
            description: "",
        })
    }

    render() {
        return (
            <Modal onKeyDown={this.handleKeyevent} show={this.props.callback.getCatAddShow()} onHide={this.dismissPopUp} className="ep-modal-dialog">
                <Modal.Header closeButton>
                    <Modal.Title>{StringSelector.getString(this.props.callback.state.language).addCat}:</Modal.Title>
                </Modal.Header>
                <Modal.Body className="ep-modal-body">
                    <Card.Body>
                        { this.state.missingName ?
                            <InputGroup size="lg" className="mb-3">
                                <InputGroup.Prepend>
                                    <InputGroup.Text id="inputGroup-sizing-lg">{StringSelector.getString(this.props.callback.state.language).addCatName}</InputGroup.Text>
                                </InputGroup.Prepend>
                                <FormControl className="text-danger is-invalid" autoComplete="off" id="name" aria-label="Large" aria-describedby="inputGroup-sizing-sm" value={this.state.name} onChange={this.changeInput}/>
                            </InputGroup>
                            :
                            <InputGroup size="lg" className="mb-3">
                                <InputGroup.Prepend>
                                    <InputGroup.Text id="inputGroup-sizing-lg">{StringSelector.getString(this.props.callback.state.language).addCatName}</InputGroup.Text>
                                </InputGroup.Prepend>
                                <FormControl autoComplete="off" id="name" aria-label="Large" aria-describedby="inputGroup-sizing-sm" value={this.state.name} onChange={this.changeInput}/>
                            </InputGroup>
                        }
                        <hr/>
                        <InputGroup size="sm" className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroup-sizing-sm">{StringSelector.getString(this.props.callback.state.language).addCatDesc}</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl autoComplete="off" id="description" aria-label="Small" aria-describedby="inputGroup-sizing-sm" value={this.state.description} onChange={this.changeInput}/>
                        </InputGroup>
                    </Card.Body>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant={"danger"} onClick={this.addCat}>{StringSelector.getString(this.props.callback.state.language).addCatAdd}</Button>
                </Modal.Footer>
            </Modal>
        );
    }

}
