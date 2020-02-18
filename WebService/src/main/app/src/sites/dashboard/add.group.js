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
import Table from "react-bootstrap/Table";


export default class AddGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            nameError: false,

            // visibility
            userGroupAdd: "",
            userGroupAddError: false,
            userGroupList: [],
            popUpGroupError: false,
            groupErrTyp: 0,
        };

        this.handleKeyevent = this.handleKeyevent.bind(this);
        this.changeInput = this.changeInput.bind(this);
        this.addToGroupAdd = this.addToGroupAdd.bind(this);
        this.removeUserFromGroup = this.removeUserFromGroup.bind(this);
    }

    resetState() {
        this.setState({
            name: "",
            nameError: false,

            // visibility
            userGroupAdd: "",
            userGroupAddError: false,
            userGroupList: [],
            popUpGroupError: false,
            groupErrTyp: 0,
        })
    }

    changeInput(e) {
        this.setState({
            [e.target.id]: e.target.value,
        });
        if ( e.target.id === "name" && e.target.value.length > 0 ) {
            this.setState({
                nameError: false,
            })
        }
        if ( e.target.id === "userGroupAdd" && e.target.value.length > 0 ) {
            this.setState({
                userGroupAddError: false,
            })
        }
    }

    handleKeyevent(event) {
        if (event.keyCode === 13 )
        {
            // Enter
            this.addGroup();
        }
    }

    addGroup() {
        if ( this.state.name.length === 0 ) {
            this.setState({
                nameError: true,
            });
        }
        else {
            this.props.callback.addGroup(this.state.name, this.state.userGroupList);
            this.props.callback.dismissAddGroup();
            this.resetState();
        }
    }

    removeUserFromGroup( ind ) {
        let arr = this.state.userGroupList;
        arr.splice(ind, 1);
        this.setState({
            userGroupList: arr,
        });
    }

    addToGroupAdd() {
        if ( this.state.userGroupAdd.length > 0 ) {
            if ( this.state.userGroupList.includes(this.state.userGroupAdd) ) {
                this.setState({
                    popUpGroupError: true,
                    groupErrTyp: 1,
                })
            }
            else {
                // ToDo check if user exists
                if ( true ) {
                    this.state.userGroupList.push(this.state.userGroupAdd);
                    this.setState({
                        userGroupAdd: "",
                    })
                }
                else {
                    this.setState({
                        popUpGroupError: true,
                        groupErrTyp: 0,
                    })
                }
            }
        }
        else {
            this.setState({
                userGroupAddError: true,
            });
        }
    }

    render() {
        return (
            <>
                <Modal onKeyDown={this.handleKeyevent} show={this.props.callback.getGroupAddShow()} onHide={() => {this.props.callback.disableEditGroup(); this.resetState();}} className="ep-modal-dialog addPassPopUp">
                    <Modal.Header closeButton>
                        <Modal.Title>{StringSelector.getString(this.props.callback.state.language).addGroup}:</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="ep-modal-body">
                        <Card.Body>
                            <InputGroup size="lg" className="mb-3">
                                <InputGroup.Prepend>
                                    <InputGroup.Text id="inputGroup-sizing-lg">{StringSelector.getString(this.props.callback.state.language).addGroupName}</InputGroup.Text>
                                </InputGroup.Prepend>
                                { this.state.nameError === true ?
                                    <FormControl autoComplete="off" id="name" aria-label="Large" className="is-invalid" aria-describedby="inputGroup-sizing-sm" value={this.state.name} onChange={this.changeInput}/>
                                    :
                                    <FormControl autoComplete="off" id="name" aria-label="Large" aria-describedby="inputGroup-sizing-sm" value={this.state.name} onChange={this.changeInput}/>
                                }
                            </InputGroup>
                            <hr/>
                            <h6>{StringSelector.getString(this.props.callback.state.language).addGroupVis}</h6>
                            <InputGroup size="sm" className="mb-3">
                                <InputGroup.Prepend>
                                    <InputGroup.Text id="inputGroup-sizing-sm">{StringSelector.getString(this.props.callback.state.language).username}</InputGroup.Text>
                                </InputGroup.Prepend>
                                { this.state.userGroupAddError ?
                                    <Form.Control autoComplete="off" id="userGroupAdd" className="is-invalid" aria-label="Small" aria-describedby="inputGroup-sizing-sm" value={this.state.userGroupAdd} placeholder={StringSelector.getString(this.props.callback.state.language).addGroupUserInpPlaceholder} onChange={this.changeInput}/>
                                    :
                                    <Form.Control autoComplete="off" id="userGroupAdd" aria-label="Small" aria-describedby="inputGroup-sizing-sm" value={this.state.userGroupAdd} placeholder={StringSelector.getString(this.props.callback.state.language).addGroupUserInpPlaceholder} onChange={this.changeInput}/>
                                }
                                <InputGroup.Append>
                                    <Button variant="dark" className="buttonSpaceInline" onClick={this.addToGroupAdd}>
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
                            {this.props.callback.getVisibilityTable(this.state.userGroupList, this)}
                            {this.props.callback.getGroupErrorMsg(this.state.popUpGroupError, this.state.groupErrTyp)}
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

