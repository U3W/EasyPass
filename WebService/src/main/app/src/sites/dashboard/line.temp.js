import React, { useState } from 'react';
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import "./line.style.css"
import Accordion from "react-bootstrap/Accordion";
import Col from "react-bootstrap/Col";
/* Button icons */
import CopyIcon from "../../img/icons/password_copy_white.svg";
import GoToIcon from "../../img/icons/password_gotowebsite_white.svg"
import EditIcon from "../../img/icons/password_edit_white.svg"
import DeleteIcon from "../../img/icons/password_delete_white.svg"
import ShowIcon from "../../img/icons/password_show_white.svg"
import HideIcon from "../../img/icons/password_hide_white.svg"
import SaveChanges from "../../img/icons/password_savechanges_white.svg"

import Row from "react-bootstrap/Row";
import {Container} from "react-bootstrap";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import {password, wrongLogin, wrongLoginHeader} from "../../strings/stings";
import Alert from "react-bootstrap/Alert";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import Tooltip from "react-bootstrap/Tooltip";

/**
 * @param id: which element in a list f.e. (must be unique, because with this id the collapsible div will be opened then toggled)
 * @param img: a link to the website (f.e. "www.google.com/"). Note that the / at the end is necessary for getting the favicon (Icon on the beginning of the card)
 * @param title: title of this password
 * @param user: username of this password
 * @param pass: password
 * @param url: link to the login page
 * @param callback: Link to the dashboard class
 * @param rest
 */
export default class PassLine extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            show: false,
            showCopyAlert: false,
            edit: false,
            passwordNew: "",
            userNew: this.props.user,
            titleNew: this.props.title,
            urlNew: this.props.url,
            catIdNew: this.props.id,
            tagNew: this.props.tag,
        };

        this.setPassword = this.setPassword.bind(this);
        this.getPassword = this.getPassword.bind(this);
        this.setEdit = this.setEdit.bind(this);
        this.changeListener = this.changeListener.bind(this);
    }

    changeListener( e ) {
        console.log("Change");
        console.log(e.target.id);
        switch (e.target.id) {
            case "password":
                this.setState({
                    passwordNew: e.target.value
                });
                break;
            case "username":
                this.setState({
                    userNew: e.target.value
                });
                break;
            case "title":
                this.setState({
                    titleNew: e.target.value
                });
                break;
            case "url":
                this.setState({
                    urlNew: e.target.value
                });
                break;
            case "cat":
                break;
            case "tag":
                break;
        }
    }

    saveEdit() {
        this.props.callback.saveEdit(this.props.id, this.state.userNew, this.state.passwordNew, this.state.titleNew, this.state.catNew, this.state.tagNew);
    }

    /**
     * Before calling setEdit, when saving the edited state, saveEdit needs to be called first
     * @param changeTo (true|false)
     */
    setEdit( changeTo ) {
        if ( changeTo ) {
            this.setState({
                passwordNew: this.props.callback.getPassword(this.props.id),
            });
        }
        else {
            this.setState({
                passwordNew: "",
                userNew: this.props.user,
                titleNew: this.props.title,
                urlNew: this.props.url,
                catIdNew: this.props.id,
                tagNew: this.props.tag,
            });
        }
        this.setState({
            edit: changeTo,
            show: changeTo,
        })
    }

    setPassword() {
        this.setState({
            show: !this.state.show
        });
    }
    setPasswordTo(to) {
        this.setState({
            show: to
        });
    }

    getPassword(id) {
        if ( this.state.show ) {
            return this.props.callback.getPassword(id);
        }
    }


    /**
     * To fulfill the .map(...)'s key requirement
     * See: https://reactjs.org/docs/lists-and-keys.html
     * @param tag [] the array
     */
    addKeyToTagArray( tag ) {
        for ( let i = 0; i < tag.length; i++ ) {
            tag[i]["id"] = i;
        }
        return tag;
    }

    render() {
        let password = this.getPassword(this.props.id);

        console.log("Start of render");
        let tag;
        //let tag = this.addKeyToTagArray(this.state.tagNew);
        //console.log("Tag", tag);
        /*let tagRender = tag.map(function (tag) {
            function renderTag(tag, tagKey) {
                return (
                    <InputGroup size="sm">
                        <InputGroup.Prepend>
                            <FormControl aria-label="Small" aria-describedby="inputGroup-sizing-sm" value={"Test"}/>
                        </InputGroup.Prepend>
                        <FormControl aria-label="Small" aria-describedby="inputGroup-sizing-sm" value={""}/>
                    </InputGroup>
                );
            }
            console.log("Tag");
            console.log(tag);
            console.log(Object.keys(tag));



            let out = renderTag(tag, Object.keys(tag));
            return (
                <div>

                </div>
            );
        });*/

        // Password when edited
        let noEdit = (
            <>
                {this.state.show === true ?
                    <FormControl aria-label="Small" aria-describedby="inputGroup-sizing-sm" type={"text"} disabled={true} value={password}/>
                    :
                    <FormControl aria-label="Small" aria-describedby="inputGroup-sizing-sm" type={"password"} disabled={true} value={"*****"}/>
                }
                {this.state.show === true ?
                    <Button variant="dark" className="buttonSpaceInline notRound" onClick={this.setPassword}>
                        <img
                            src={HideIcon}
                            alt=""
                            width="14"
                            height="14"
                            className="d-inline-block"
                        />
                    </Button>
                    :
                    <Button variant="dark" className="buttonSpaceInline notRound" onClick={this.setPassword}>
                        <img
                            src={ShowIcon}
                            alt=""
                            width="14"
                            height="14"
                            className="d-inline-block"
                        />
                    </Button>
                }
            </>
        );

        let edit = (
            <>
                <FormControl id="password" aria-label="Small" type={"text"} aria-describedby="inputGroup-sizing-sm" onChange={this.changeListener} disabled={false} value={this.state.passwordNew}/>
                <Button variant="dark" disabled={true} className="buttonSpaceInline notRound">
                    <img
                        src={HideIcon}
                        alt=""
                        width="14"
                        height="14"
                        className="d-inline-block"
                    />
                </Button>
            </>
        );
        return (
            <Card className="pass-card" name="passCard">
                <input id="searchInput" type="hidden" value={this.props.title}/>
                <Accordion.Toggle as={Card.Header} className="clickable center-vert" eventKey={this.props.id} onClick={() => this.setPasswordTo(false)}>
                    <Row>
                        <Col sm={1} md={1} lg={1} xs={1} className="fixLogoCol">
                            <img
                                src={this.props.img + "favicon.ico"}
                                alt=""
                                width="24"
                                height="24"
                                className="d-inline-block scaleimg fixLogo"
                            />
                        </Col>
                        <Col sm={10} md={10} lg={10} xs={10} className="">
                            <Row className="no-padding ">
                                <Col>
                                    <h5 className="inline">{this.props.title}</h5>
                                    <br className="fixTitle"/>
                                    <div className="username inline fixUsername">
                                        {this.props.user}
                                    </div>
                                </Col>
                                <Col>

                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Accordion.Toggle>
                <div className="center-vert setButtonsRight">
                    {this.state.edit === true ? // Copy and GoToWebsite Buttons
                        <>
                            <Button variant="dark" className="buttonSpace" disabled={true}>
                                <img
                                    src={CopyIcon}
                                    alt=""
                                    width="24"
                                    height="24"
                                    className="d-inline-block scaleimg"
                                />
                            </Button>
                            <Button variant="dark" className="buttonSpace" disabled={true}>
                                <img
                                    src={GoToIcon}
                                    alt=""
                                    width="24"
                                    height="24"
                                    className="d-inline-block scaleimg"
                                />
                            </Button>
                        </>
                        :
                        <>
                            <Button variant="dark" className="buttonSpace" onClick={() => this.props.callback.copyPass(this.props.id)}>
                                <img
                                    src={CopyIcon}
                                    alt=""
                                    width="24"
                                    height="24"
                                    className="d-inline-block scaleimg"
                                />
                            </Button>
                            <Button variant="dark" className="buttonSpace" onClick={() => this.props.callback.goToPage(this.props.url)}>
                                <img
                                    src={GoToIcon}
                                    alt=""
                                    width="24"
                                    height="24"
                                    className="d-inline-block scaleimg"
                                />
                            </Button>
                        </>
                    }
                </div>
                <Accordion.Collapse eventKey={this.props.id}>
                    <>
                        <Card.Body>
                            <Card.Title>
                            {this.state.edit === true ? // Title
                                <InputGroup size="lg">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="inputGroup-sizing-lg">Name</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <FormControl id="title" aria-label="Large" aria-describedby="inputGroup-sizing-sm" value={this.state.titleNew} onChange={this.changeListener} />
                                </InputGroup>
                                :
                                this.props.title
                            }
                            </Card.Title>
                            <div>
                                <InputGroup size="sm" className="mb-3">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="inputGroup-sizing-sm">User</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    {this.state.edit === true ? // Username
                                        <>
                                            <FormControl id="username" aria-label="Small" aria-describedby="inputGroup-sizing-sm" disabled={false} onChange={this.changeListener} value={this.state.userNew}/>
                                            <Button variant="dark" className="buttonSpaceInline" disabled={true}>
                                                <img
                                                    src={CopyIcon}
                                                    alt=""
                                                    width="14"
                                                    height="14"
                                                    className="d-inline-block"
                                                />
                                            </Button>
                                        </>
                                        :
                                        <>
                                            <FormControl aria-label="Small" aria-describedby="inputGroup-sizing-sm" disabled={true} value={this.props.user}/>
                                            <Button variant="dark" className="buttonSpaceInline" onClick={() => this.props.callback.copy(this.props.user)}>
                                                <img
                                                    src={CopyIcon}
                                                    alt=""
                                                    width="14"
                                                    height="14"
                                                    className="d-inline-block"
                                                />
                                            </Button>
                                        </>
                                    }
                                </InputGroup>
                                <InputGroup size="sm" className="mb-3">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="inputGroup-sizing-sm">Password</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    {this.state.edit === true ?
                                        edit
                                        :
                                        noEdit
                                    }

                                    <hr className="vertical-button-sep"/>
                                    {this.state.edit === true ? // Show Password Buttons
                                        <Button variant="dark" className="buttonSpaceInline "  disabled={true}>
                                            <img
                                                src={CopyIcon}
                                                alt=""
                                                width="14"
                                                height="14"
                                                className="d-inline-block"
                                            />
                                        </Button>
                                        :
                                        <Button variant="dark" className="buttonSpaceInline " onClick={() => this.props.callback.copyPass(this.props.id)}>
                                            <img
                                                src={CopyIcon}
                                                alt=""
                                                width="14"
                                                height="14"
                                                className="d-inline-block"
                                            />
                                        </Button>
                                    }
                                </InputGroup>
                                <InputGroup size="sm" className="mb-3">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="inputGroup-sizing-sm">Website (Login)</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    {this.state.edit === true ? // URL
                                        <>
                                            <FormControl id="url" aria-label="Small" aria-describedby="inputGroup-sizing-sm" disabled={false} onChange={this.changeListener} value={this.state.urlNew}/>
                                            <Button variant="dark" className="buttonSpaceInline" disabled={true}>
                                                <img
                                                    src={CopyIcon}
                                                    alt=""
                                                    width="14"
                                                    height="14"
                                                    className="d-inline-block"
                                                />
                                            </Button>
                                        </>
                                        :
                                        <>
                                            <FormControl aria-label="Small" aria-describedby="inputGroup-sizing-sm" disabled={true} value={this.props.url}/>
                                            <Button variant="dark" className="buttonSpaceInline" onClick={() => this.props.callback.copy(this.props.url)}>
                                                <img
                                                    src={CopyIcon}
                                                    alt=""
                                                    width="14"
                                                    height="14"
                                                    className="d-inline-block"
                                                />
                                            </Button>
                                        </>
                                    }
                                </InputGroup>
                                <div>
                                    <h6>Tags</h6>
                                    {tag}
                                </div>
                                <br/>
                                <div>
                                    <h6>Kategorien</h6>
                                    Hello
                                </div>
                            </div>
                        </Card.Body>
                        <Card.Footer className="text-muted">
                            <Row>
                                <Col className="footerContainer">
                                    <ButtonToolbar>
                                        {['bottom'].map(placement => (
                                            <OverlayTrigger
                                                key={placement}
                                                placement={placement}
                                                overlay={
                                                    this.state.edit === true ?
                                                        <Tooltip id={`tooltip-${placement}`}>
                                                            Änderungen verwerfen
                                                        </Tooltip>
                                                        :
                                                        <Tooltip id={`tooltip-${placement}`}>
                                                            Dieses Passwort bearbeiten
                                                        </Tooltip>
                                                }
                                            >
                                                { this.state.edit === true ?
                                                    <Button variant="dark" className="footerButton center-horz" onClick={() => this.setEdit(false)}>
                                                        <img
                                                            src={DeleteIcon}
                                                            alt=""
                                                            width="16"
                                                            height="16"
                                                            className="footerButtonImg"
                                                        />
                                                    </Button>
                                                    :
                                                    <Button variant="dark" className="footerButton center-horz" onClick={() => this.setEdit(true)}>
                                                        <img
                                                            src={EditIcon}
                                                            alt=""
                                                            width="16"
                                                            height="16"
                                                            className="footerButtonImg"
                                                        />
                                                    </Button>
                                                }

                                            </OverlayTrigger>
                                        ))}
                                    </ButtonToolbar>
                                </Col>
                                <Col className="footerContainer">
                                    <ButtonToolbar>
                                        {['bottom'].map(placement => (
                                            <OverlayTrigger
                                                key={placement}
                                                placement={placement}
                                                overlay={this.state.edit === true ?
                                                    <Tooltip id={`tooltip-${placement}`}>
                                                        Änderungen speichern
                                                    </Tooltip>
                                                    :
                                                    <Tooltip id={`tooltip-${placement}`}>
                                                        Dieses Passwort löschen
                                                    </Tooltip>
                                                }
                                            >
                                                {this.state.edit === true ?
                                                    <Button variant="dark" className="footerButton center-horz" onClick={() => alert("Speichern")}>
                                                        <img
                                                            src={SaveChanges}
                                                            alt=""
                                                            width="16"
                                                            height="16"
                                                            className="footerButtonImg"
                                                        />
                                                    </Button>
                                                    :
                                                    <Button variant="dark" className="footerButton center-horz" onClick={() => this.props.callback.deletePass(this.props.id)}>
                                                        <img
                                                            src={DeleteIcon}
                                                            alt=""
                                                            width="16"
                                                            height="16"
                                                            className="footerButtonImg"
                                                        />
                                                    </Button>
                                                }

                                            </OverlayTrigger>
                                        ))}
                                    </ButtonToolbar>

                                </Col>
                            </Row>
                        </Card.Footer>
                    </>
                </Accordion.Collapse>
            </Card>
        );
    }
}
