import React from "react";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import GeneratePassIcon from "../../img/icons/generate_password_white.svg";
import {Card} from "react-bootstrap";

export default class AddCategory extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            name: "",
            description: "",
        };

        this.dismissPopUp = this.dismissPopUp.bind(this);
        this.resetState = this.resetState.bind(this);
    }

    changeInput = (e) => {
        this.setState({
            [e.target.id]: e.target.value,
        });

    };

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
            <Modal show={this.props.callback.getCatAddShow()} onHide={this.dismissPopUp} className="ep-modal-dialog">
                <Modal.Header closeButton>
                    <Modal.Title>Kategorie hinzufügen</Modal.Title>
                </Modal.Header>
                <Modal.Body className="ep-modal-body">
                    <Card.Body>
                        <InputGroup size="lg" className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroup-sizing-lg">Name</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl autoComplete="off" id="name" aria-label="Large" aria-describedby="inputGroup-sizing-sm" value={this.state.name} onChange={this.changeInput}/>
                        </InputGroup>
                        <hr/>
                        <InputGroup size="sm" className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroup-sizing-sm">Beschreibung</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl autoComplete="off" id="description" aria-label="Small" aria-describedby="inputGroup-sizing-sm" value={this.state.description} onChange={this.changeInput}/>
                        </InputGroup>
                    </Card.Body>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant={"danger"} onClick={() => this.props.callback.addCat(this.state.name, this.state.description)}>Hinzufügen</Button>
                </Modal.Footer>
            </Modal>
        );
    }

}
