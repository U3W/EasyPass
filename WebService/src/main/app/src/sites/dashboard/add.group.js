import React from "react";
import Modal from "react-bootstrap/Modal";
import StringSelector from "../../strings/stings";
import {Card, Form} from "react-bootstrap";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import GeneratePassIcon from "../../img/icons/generate_password_white.svg";
import tabs from "./tabs/tab.enum";
import AddTag from "../../img/icons/password_add_tag.svg";
import GeneratePass from "./generatepass";


export default class AddGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            userGroupAdd: "",
            userGroupList: [],
        };
    }

    resetState() {
        this.setState({

        })
    }

    changeInput(e) {

    }

    handleKeyevent(event) {
        if (event.keyCode === 13 )
        {
            // Enter
            this.addGroup();
        }
    }

    dismissPopUp() {

    }


    addGroup() {

    }

    render() {
        return (
            <>
                <Modal onKeyDown={this.handleKeyevent} show={this.props.callback.getGroupAddShow()} onHide={this.props.callback.dismissAddGroup} className="ep-modal-dialog addPassPopUp">
                    <Modal.Header closeButton>
                        <Modal.Title>{StringSelector.getString(this.props.callback.state.language).addGroup}:</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="ep-modal-body">
                        <Card.Body>
                            <InputGroup size="lg" className="mb-3">
                                <InputGroup.Prepend>
                                    <InputGroup.Text id="inputGroup-sizing-lg">{StringSelector.getString(this.props.callback.state.language).addGroupName}</InputGroup.Text>
                                </InputGroup.Prepend>
                                <FormControl autoComplete="off" id="title" aria-label="Large" aria-describedby="inputGroup-sizing-sm" value={this.state.name} onChange={this.changeInput}/>
                            </InputGroup>
                            <hr/>
                            <h6>{StringSelector.getString(this.props.callback.state.language).addGroupVis}</h6>
                            <InputGroup size="sm" className="mb-3">
                                <InputGroup.Prepend>
                                    <InputGroup.Text id="inputGroup-sizing-sm">{StringSelector.getString(this.props.callback.state.language).username}</InputGroup.Text>
                                </InputGroup.Prepend>
                                <Form.Control autoComplete="off" id="userGroupAdd" aria-label="Small" aria-describedby="inputGroup-sizing-sm" value={this.state.userGroupAdd} placeholder={StringSelector.getString(this.props.callback.state.language).addGroupUserInpPlaceholder} onChange={this.changeInput}/>
                                <InputGroup.Append>
                                    <Button variant="dark" className="buttonSpaceInline" >
                                        <img
                                            src={AddTag}
                                            alt=""
                                            width="14"
                                            height="14"
                                            className="d-inline-block"
                                        />
                                    </Button>
                                </InputGroup.Append>
                            </InputGroup>
                        </Card.Body>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant={"danger"} onClick={this.addGroup}>{StringSelector.getString(this.props.callback.state.language).addGroupBut}</Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }

}
