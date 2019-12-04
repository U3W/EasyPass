import React from "react";
import Modal from "react-bootstrap/Modal";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import {Card} from "react-bootstrap";
import Table from "react-bootstrap/Table";

export default class EditCategory extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            id: 0,
            catName: "Kategorie auswählen",

            nameNew: "",
            descriptionNew: "",

            catPopUpShow: false,
        };

        this.dismissPopUp = this.dismissPopUp.bind(this);

        this.setPopUpCatEnabled = this.setPopUpCatEnabled.bind(this);
        this.setPopUpCatDisabled = this.setPopUpCatDisabled.bind(this);

        this.changeInput = this.changeInput.bind(this);

        this.resetState = this.resetState.bind(this);
    }

    changeInput = (e) => {
        this.setState({
            [e.target.id]: e.target.value,
        });

    };

    dismissPopUp() {
        this.resetState();
        this.props.callback.dismissEditCat();
    }


    setPopUpCatEnabled() {
        this.setState({
            catPopUpShow: true,
        });
    }
    setPopUpCatDisabled() {
        this.setState({
            catPopUpShow: false,
        });
    }

    returnCatBase ( id, name, desc) {
        return (
            <tr key={id}>
                <td onClick={() => this.changeCat(id, name, desc)}>
                    {name}
                </td>
            </tr>
        );
    }

    changeCat(id, name, desc) {
        this.setPopUpCatDisabled();
        this.setState({
            id: id,
            catName: name,
            name: name,
            description: desc,
        });
    }
    getPopUpCat()  {
        let cats = this.props.callback.getCats();

        let finalCats = cats.map((item) =>
            this.returnCatBase(item.id, item.name, item.desc)
        );

        return (
            <>
                <Modal show={this.state.catPopUpShow} onHide={this.setPopUpCatDisabled} className="ep-modal-dialog">
                    <Modal.Header closeButton>
                        <Modal.Title>Kategorie auswählen:</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="ep-modal-body">
                        <Table striped bordered hover className="ep-modal-table">
                            <tbody>
                                {finalCats}
                            </tbody>
                        </Table>
                    </Modal.Body>
                </Modal>
            </>
        );
    }


    resetState() {
        this.setState({
            id: 0,
            catName: "Kategorie auswählen",

            nameNew: "",
            descriptionNew: "",

            catPopUpShow: false,

            nameError: false,
        })
    }

    editCat() {
        if ( this.state.nameNew.length !== 0 ) {
            this.props.callback.editCat(this.state.id, this.state.nameNew, this.state.descriptionNew)
        }
        else {
            // error
        }
    }

    render() {

        let hidden = (
            <>
                <InputGroup size="lg" className="mb-3">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="inputGroup-sizing-lg">Name</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl autoComplete="off" id="name" aria-label="Large" aria-describedby="inputGroup-sizing-sm" value={this.state.name} disabled={true} onChange={() => { if ( this.state.id !== 0 ) this.changeInput() }}/>
                </InputGroup>
                <hr/>
                <InputGroup size="sm" className="mb-3">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="inputGroup-sizing-sm">Beschreibung</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl autoComplete="off" id="description" aria-label="Small" aria-describedby="inputGroup-sizing-sm" value={this.state.description} disabled={true} onChange={() => { if ( this.state.id !== 0 ) this.changeInput() }}/>
                </InputGroup>
            </>
        );

        let edit = (
            <>
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
            </>
        );


        return (
            <>
                <Modal show={this.props.callback.getCatEditShow()} onHide={this.dismissPopUp} className="ep-modal-dialog addPassPopUp">
                    <Modal.Header closeButton>
                        <Modal.Title>Kategorie bearbeiten</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="ep-modal-body">
                        <Card.Body>
                            <InputGroup size="sm" className="mb-3 editCat" onClick={this.setPopUpCatEnabled}>
                                <FormControl autoComplete="off" aria-label="Small" className="round-cat dropdown-toggle nav-link" role="button" value={this.state.catName} aria-describedby="inputGroup-sizing-sm" disabled={true}/>
                                <InputGroup.Append>
                                    <Button variant="dark" className="dropdown-toggle dropdown-toggle-split" onClick={this.setPopUpCatEnabled}>
                                        <span className="sr-only">Toggle Dropdown</span>
                                    </Button>
                                </InputGroup.Append>
                            </InputGroup>
                            { this.state.id === 0 ?
                                hidden
                                :
                                edit
                            }
                        </Card.Body>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant={"danger"} onClick={() => this.editCat()}>Hinzufügen</Button>
                    </Modal.Footer>
                </Modal>
                {this.getPopUpCat()}
            </>
        );
    }

}
