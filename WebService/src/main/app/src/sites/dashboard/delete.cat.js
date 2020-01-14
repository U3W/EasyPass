import React from "react";
import Modal from "react-bootstrap/Modal";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import {Card} from "react-bootstrap";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";

export default class DeleteCategory extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            catDelIds: [],
        };

        this.setCatDel = this.setCatDel.bind(this);

        this.resetState = this.resetState.bind(this);

        this.handleKeyevent = this.handleKeyevent.bind(this);

        this.dismissPopUp = this.dismissPopUp.bind(this);

        this.delCat = this.delCat.bind(this);
    }


    setCatDel( id ) {
        let catDelIds = this.state.catDelIds;
        if ( catDelIds.indexOf(id) === -1 ) {
            catDelIds.push(id);
        }
        else {
            catDelIds.splice(catDelIds.indexOf(id), 1);
        }
    };

    returnCatBase ( id, name, desc) {
        return (
            <tr key={id}>
                <td>
                    <b>{name}</b>
                </td>
                <td>
                    {desc}
                </td>
                <td>
                    {['checkbox'].map(type => (
                        <div key={`custom-inline-${type}`} className="float-center">
                            <Form.Check
                                custom
                                inline
                                label=""
                                type={type}
                                id={`custom-inline-${type}-${id}`}
                                onClick={() =>this.setCatDel(id)}
                            />
                        </div>
                    ))}
                </td>
            </tr>
        );
    }



    resetState() {
        this.setState({
            catDelIds: Array.from([]),
        })
    }

    delCat() {
        this.props.callback.deleteCat(this.state.catDelIds);
        this.resetState();
    }

    dismissPopUp() {
        this.resetState();
        this.props.callback.dismissDeleteCat();
    }

    handleKeyevent(event) {
        if (event.keyCode === 13 )
        {
            // Enter
            this.editCat()
        }
    }


    render() {
        let finalCats = this.props.callback.getCats().map((item) =>
            this.returnCatBase(item.id, item.name, item.desc)
        );


        return (
            <>
                <Modal onKeyDown={this.handleKeyevent} show={this.props.callback.getCatDeleteShow()} onHide={this.dismissPopUp} className="del-modal-dialog addPassPopUp">
                    <Modal.Header closeButton>
                        <Modal.Title>Kategorie löschen:</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="del-modal-body">
                        <Table striped bordered hover className="del-modal-table">
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Beschreibung</th>
                                <th>Löschen</th>
                            </tr>
                            </thead>
                            <tbody>
                                {finalCats}
                            </tbody>
                        </Table>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant={"danger"} onClick={this.delCat}>Löschen</Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }

}
