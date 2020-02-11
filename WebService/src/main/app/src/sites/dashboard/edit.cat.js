import React from "react";
import Modal from "react-bootstrap/Modal";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import {Card} from "react-bootstrap";
import Table from "react-bootstrap/Table";
import StringSelector from "../../strings/stings";

export default class EditCategory extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            id: undefined,
            rev: undefined,
            catName: StringSelector.getString(this.props.callback.state.language).editCatSelCat,

            nameNew: "",
            descriptionNew: "",

            catPopUpShow: false,

            missingName: false,
        };

        this.dismissPopUp = this.dismissPopUp.bind(this);

        this.setPopUpCatEnabled = this.setPopUpCatEnabled.bind(this);
        this.setPopUpCatDisabled = this.setPopUpCatDisabled.bind(this);

        this.changeInput = this.changeInput.bind(this);
        this.editCat = this.editCat.bind(this);

        this.resetState = this.resetState.bind(this);

        this.handleKeyevent = this.handleKeyevent.bind(this);
    }

    changeInput = (e) => {
        this.setState({
            [e.target.id]: e.target.value,
        }, () => { if ( this.state.nameNew.length > 0 ) { this.setState({ missingName: false})} });
        //console.log("Target:", e.target.id);
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

    returnCatBase ( id, rev, name, desc) {
        return (
            <tr key={id}>
                <td onClick={() => this.changeCat(id, rev, name, desc)}>
                    {name}
                </td>
            </tr>
        );
    }

    changeCat(id, rev, name, desc) {
        this.setPopUpCatDisabled();
        this.setState({
            id: id,
            rev: rev,
            catName: name,
            nameNew: name,
            descriptionNew: desc,
        });
    }
    getPopUpCat()  {
        let cats = this.props.callback.getCats();

        let finalCats = cats.map((item) =>
            this.returnCatBase(item._id, item._rev, item.name, item.desc)
        );

        return (
            <>
                <Modal show={this.state.catPopUpShow} onHide={this.setPopUpCatDisabled} className="ep-modal-dialog">
                    <Modal.Header closeButton>
                        <Modal.Title>{StringSelector.getString(this.props.callback.state.language).editCatSelCat}:</Modal.Title>
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
            catName: StringSelector.getString(this.props.callback.state.language).editCatSelCat,

            nameNew: "",
            descriptionNew: "",

            catPopUpShow: false,

            missingName: false,
        })
    }

    editCat() {
        if ( this.state.nameNew.length !== 0 ) {
            this.props.callback.updateCat(this.state.id, this.state.rev, this.state.nameNew, this.state.descriptionNew);
            this.resetState();
        }
        else {
            // error
            this.setState({
                missingName: true,
            })
        }
    }

    handleKeyevent(event) {
        if (event.keyCode === 13 )
        {
            // Enter
            this.editCat()
        }
    }


    render() {

        let hidden = (
            <>
                <InputGroup size="lg" className="mb-3">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="inputGroup-sizing-lg">{StringSelector.getString(this.props.callback.state.language).addCatName}</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl autoComplete="off" id="nameNew" aria-label="Large" aria-describedby="inputGroup-sizing-sm" value={this.state.nameNew} disabled={true} onChange={() => { if ( this.state.id !== 0 ) this.changeInput() }}/>
                </InputGroup>
                <hr/>
                <InputGroup size="sm" className="mb-3">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="inputGroup-sizing-sm">{StringSelector.getString(this.props.callback.state.language).addCatDesc}</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl autoComplete="off" id="descriptionNew" aria-label="Small" aria-describedby="inputGroup-sizing-sm" value={this.state.descriptionNew} disabled={true} onChange={() => { if ( this.state.id !== 0 ) this.changeInput() }}/>
                </InputGroup>
            </>
        );

        let edit = (
            <>
                { this.state.missingName ?
                    <InputGroup size="lg" className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text id="inputGroup-sizing-lg">{StringSelector.getString(this.props.callback.state.language).addCatName}</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl className="text-danger is-invalid"  autoComplete="off" id="nameNew" aria-label="Large" aria-describedby="inputGroup-sizing-sm" value={this.state.nameNew} onChange={this.changeInput}/>
                    </InputGroup>
                    :
                    <InputGroup size="lg" className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text id="inputGroup-sizing-lg">{StringSelector.getString(this.props.callback.state.language).addCatName}</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl autoComplete="off" id="nameNew" aria-label="Large" aria-describedby="inputGroup-sizing-sm" value={this.state.nameNew} onChange={this.changeInput}/>
                    </InputGroup>
                }

                <hr/>

                <InputGroup size="sm" className="mb-3">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="inputGroup-sizing-sm">{StringSelector.getString(this.props.callback.state.language).addCatDesc}</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl autoComplete="off" id="descriptionNew" aria-label="Small" aria-describedby="inputGroup-sizing-sm" value={this.state.descriptionNew} onChange={this.changeInput}/>
                </InputGroup>
            </>
        );


        return (
            <>
                <Modal onKeyDown={this.handleKeyevent} show={this.props.callback.getCatEditShow()} onHide={this.dismissPopUp} className="ep-modal-dialog addPassPopUp">
                    <Modal.Header closeButton>
                        <Modal.Title>{StringSelector.getString(this.props.callback.state.language).editCat}:</Modal.Title>
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
                        <Button variant={"danger"} onClick={this.editCat}>Speichern</Button>
                    </Modal.Footer>
                </Modal>
                {this.getPopUpCat()}
            </>
        );
    }

}
