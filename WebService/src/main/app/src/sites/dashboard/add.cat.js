import React from "react";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";

export default class AddCategory extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            name: "",
            description: "",
        };

        this.dismissPopUp = this.dismissPopUp.bind(this);
    }

    dismissPopUp() {
        this.props.callback.dismissAddCat();
    }

    render() {
        return (
            <Modal show={this.props.callback.getCatAddShow()} onHide={this.dismissPopUp} className="ep-modal-dialog">
                <Modal.Header closeButton>
                    <Modal.Title>Kategorie hinzufügen</Modal.Title>
                </Modal.Header>
                <Modal.Body className="ep-modal-body">
                    <Table striped bordered hover className="ep-modal-table">
                        <tbody>

                        </tbody>
                    </Table>
                </Modal.Body>
            </Modal>
        );
    }

}
