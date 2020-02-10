import React from "react";
import Modal from "react-bootstrap/Modal";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import {Card} from "react-bootstrap";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import StringSelector from "../../strings/stings";

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


    setCatDel( id, rev) {
        let catDelIds = this.state.catDelIds;
        if ( catDelIds.map((e) => {return e._id;}).indexOf(id) === -1 ) {
            catDelIds.push({_id: id, _rev: rev});
        }
        else {
            //catDelIds.splice(catDelIds.indexOf([id, rev]), 1);
            catDelIds.splice(catDelIds.map((e) => {return e._id;}).indexOf(id), 1);
        }
        this.setState({
            catDelIds: catDelIds,
        });
    };

    catDelIdsIncludesId( id ) {
        for ( let i = 0; i < this.state.catDelIds.length; i++ ) {
           let elm = this.state.catDelIds[i];
           if ( elm._id === id ) {
               return true;
           }
        }
        return false;
    }

    returnCatBase ( id, rev, name, desc) {
        return (
            <tr key={id} onClick={() =>this.setCatDel(id, rev)}>
                <td>
                    <b>{name}</b>
                </td>
                <td>
                    {desc}
                </td>
                <td>
                    {
                        ['checkbox'].map(type => (
                            <div key={`custom-inline-${type}`} className="float-center">
                                <Form.Check
                                    custom
                                    checked={this.catDelIdsIncludesId(id)}
                                    inline
                                    readOnly={true}
                                    label=""
                                    type={type}
                                    id={`custom-inline-${type}-${id}`}
                                    className="clickable"
                                    onClick={() =>this.setCatDel(id, rev)}
                                />
                            </div>
                        ))
                    }
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
        this.props.callback.deleteCats(this.state.catDelIds);
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
            this.delCat()
        }
    }


    render() {
        let finalCats = this.props.callback.getCats().map((item) =>
            this.returnCatBase(item._id, item._rev, item.name, item.desc)
        );


        return (
            <>
                <Modal onKeyDown={this.handleKeyevent} show={this.props.callback.getCatDeleteShow()} onHide={this.dismissPopUp} className="del-modal-dialog addPassPopUp">
                    <Modal.Header closeButton>
                        <Modal.Title>{StringSelector.getString(this.props.callback.state.language).delCat}:</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="del-modal-body">
                        <Table striped bordered hover className="del-modal-table">
                            <thead>
                            <tr>
                                <th>{StringSelector.getString(this.props.callback.state.language).addCatName}</th>
                                <th>{StringSelector.getString(this.props.callback.state.language).addCatDesc}</th>
                                <th>{StringSelector.getString(this.props.callback.state.language).delCatDel}</th>
                            </tr>
                            </thead>
                            <tbody>
                                {finalCats}
                            </tbody>
                        </Table>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant={"danger"} onClick={this.delCat}>{StringSelector.getString(this.props.callback.state.language).delCatDel}</Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }

}
