import React from 'react';
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
import AddTag from "../../img/icons/password_add_tag.svg";

import Row from "react-bootstrap/Row";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import Tooltip from "react-bootstrap/Tooltip";
import * as $ from "../../../bower_components/pouchdb-find/dist/pouchdb.find";
import {Nav, NavDropdown} from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import {dashboardAlerts} from "./const/dashboard.enum";

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
            id: this.props.id,
            passwordNew: "",
            userNew: this.props.user,
            titleNew: this.props.title,
            urlNew: this.props.url,
            catIdNew: this.props.cat,
            tagNew: this.deepCopyTags(this.props.tag),
            tagAdded: this.setTagAddedRight(this.props.tag),
            popUpCatShow: false,
        };

        this.setPassword = this.setPassword.bind(this);
        this.getPassword = this.getPassword.bind(this);
        this.setEdit = this.setEdit.bind(this);
        this.changeListener = this.changeListener.bind(this);
        this.changeTagListener = this.changeTagListener.bind(this);
        this.renderTag = this.renderTag.bind(this);
        this.renderCat = this.renderCat.bind(this);
        this.addTag = this.addTag.bind(this);

        this.setPopUpCatDisabled = this.setPopUpCatDisabled.bind(this);
        this.setPopUpCatEnabled = this.setPopUpCatEnabled.bind(this);
        this.getPopUpCat = this.getPopUpCat.bind(this);
    }

    setTagAddedRight( tags ) {
        return tags.length > 0;
    }

    deepCopyTags( tags ) {
        let out = [];
        for ( let i = 0; i < tags.length; i++ ) {
            out[i] = JSON.parse(JSON.stringify(tags[i]));
        }
        return out;
    }

    findTagKeyIndex ( keyComp ) {
        for ( let i = 0; i < this.state.tagNew.length; i++ ) {
            let key = Object.keys(this.state.tagNew[i]);
            if ( key[0] === keyComp) {
                return i;
            }
        }
    }

    changeTagListener (key, value, i, e ) {
        if ( this.state.edit && this.state.tagAdded )
        {
            console.log("Teest");
            // just tags
            let tagNew = this.state.tagNew;
            if (e.target.id.length > 8 ) {
                // tagValue + i
                if ( e.target.id.includes("tagValue") ) {
                    let test = this.findTagKeyIndex(key);
                    tagNew[i][key] = e.target.value;
                    this.setState({
                        tagNew: tagNew
                    });
                }
            } else if ( e.target.id.length > 6 ) {
                // tagKey + i
                if ( e.target.id.includes("tagKey") ) {
                    tagNew[i][e.target.value] = tagNew[i][key];
                    delete tagNew[i][key];

                    this.setState({
                        tagNew: tagNew
                    })
                }
            }
        }
    }

    addTag() {
        if ( this.state.edit )
        {
            if ( !this.state.tagAdded ) {
                this.setState({
                    tagAdded: true,
                });
            }
            let tagNew = this.state.tagNew;
            tagNew[this.state.tagNew.length] = {"":""};
            this.setState({
                tagNew: tagNew,
            });
        }
    }
    changeListener( e ) {
        if ( this.state.edit )
        {
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
            }
        }
    }

    saveEdit() {
        this.setEdit(false, true);
        this.props.callback.saveEdit(this.state.id, this.state.userNew, this.state.passwordNew, this.state.titleNew, this.state.catIdNew, this.state.tagNew);
    }

    /**
     * Before calling setEdit, when saving the edited state, saveEdit needs to be called first
     * @param changeTo (true|false)
     * @param succ (true|false) success
     */
    setEdit( changeTo, succ ) {
        console.log("ChangeTo", changeTo, this.props.tag);
        if ( changeTo ) {
            this.setState({
                passwordNew: this.props.callback.getPassword(this.props.id),
            });
        }
        else {
            if ( !succ ) {
                this.setState({
                    passwordNew: "",
                    userNew: this.props.user,
                    titleNew: this.props.title,
                    urlNew: this.props.url,
                    catIdNew: this.props.cat,
                    tagAdded: this.setTagAddedRight(this.props.tag),
                    tagNew: this.deepCopyTags(this.props.tag),
                });
            }
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


    renderTag() {
        let tag = this.state.tagNew; //this.addKeyToTagArray(this.state.tagNew);
        console.log("TagInRender", tag, this.props.tag);
        let tagCompArray = [];

        if ( tag.length === 0 ) {
            if ( this.state.edit ) {
                let but = (
                    <Button variant="dark" className="buttonSpaceInline" onClick={this.addTag}>
                        <img
                            src={AddTag}
                            alt=""
                            width="14"
                            height="14"
                            className="d-inline-block"
                        />
                    </Button>
                );
                tagCompArray[0] = (
                    <InputGroup size="sm" className="mb-3">
                        <FormControl id={"tagKey" + 0 } className="" aria-label="Small" aria-describedby="inputGroup-sizing-sm" disabled={!this.state.tagAdded} value={""} onChange={(e) => this.changeTagListener("", "", 0, e)} />
                        <FormControl id={"tagValue" + 0 } aria-label="Small" aria-describedby="inputGroup-sizing-sm" disabled={!this.state.tagAdded} value={""} onChange={(e) => this.changeTagListener("", "", 0, e)} />
                        {but}
                    </InputGroup>
                );
            }
            else {
                tagCompArray[0] = "Keine Tags vorhanden";
            }
        }
        for ( let i = 0; i < tag.length; i++ )
        {
            console.log("Tag single: ",tag[i], "I: ", i);
            let tagKeys = Object.keys(tag[i]);
            console.log("key", tagKeys);
            let but = "";
            if ( this.state.edit && i === tag.length-1) {
                but = (
                    <Button variant="dark" className="buttonSpaceInline" onClick={this.addTag}>
                        <img
                            src={AddTag}
                            alt=""
                            width="14"
                            height="14"
                            className="d-inline-block"
                        />
                    </Button>
                );
            }
            if ( this.state.edit ) {
                //                         <InputGroup.Prepend>
                //<input id={"tagKey" + i } className="input-group-text setTagEdit" disabled={false} value={tagKeys[i]} onChange={(e) => this.changeTagListener(tagKeys[i], null, e)} />
                tagCompArray[i] = (
                    <InputGroup size="sm" className="mb-3">
                        <FormControl id={"tagKey" + i } className="" aria-label="Small" aria-describedby="inputGroup-sizing-sm" disabled={false} value={tagKeys[0]} onChange={(e) => this.changeTagListener(tagKeys[0], tag[i][tagKeys[0]], i, e)} />
                        <FormControl id={"tagValue" + i } aria-label="Small" aria-describedby="inputGroup-sizing-sm" disabled={false} value={tag[i][tagKeys[0]]} onChange={(e) => this.changeTagListener(tagKeys[0], tag[i][tagKeys[0]], i, e)} />
                        {but}
                    </InputGroup>
                );
            }
            else {
                tagCompArray[i] = (
                    <InputGroup size="sm" className="mb-3">
                        <InputGroup.Prepend>
                            <input className="input-group-text fixTag" disabled={true} value={tagKeys[0]} onChange={(e) => this.changeTagListener(tagKeys[0], tag[i][tagKeys[0]], i, e)}/>
                        </InputGroup.Prepend>
                        <FormControl aria-label="Small" aria-describedby="inputGroup-sizing-sm" disabled={true} value={tag[i][tagKeys[0]]} onChange={(e) => this.changeTagListener(tagKeys[0], tag[i][tagKeys[0]], i, e)}/>
                        {but}
                    </InputGroup>
                );
            }
        }
        let key = -1;
        return tagCompArray.map(function (tagComp) {

            console.log("Tag ups", tagComp);
            key++;

            return (
                <div key={key}>
                    {tagComp}
                </div>
            );
        });
    }

    returnCatBase ( id, name) {
        console.log("Render: " + id + ", " + name);
        return (
            <tr key={id}>
                <td onClick={() => this.changePassCat(id)}>
                    {name}
                </td>
            </tr>
        );
    }
    changePassCat(id) {
        this.setPopUpCatDisabled();
        this.setState({
            catIdNew: id,
        });
    }

    setPopUpCatDisabled() {
        this.setState({
            popUpCatShow: false
        });
    }

    setPopUpCatEnabled() {
        if ( this.state.edit ) {
            this.setState({
                popUpCatShow: true
            });
        }
    }

    getPopUpCat()  {
        let cats = this.props.callback.getCats();

        let finalCats = cats.map((item) =>
            this.returnCatBase(item.id, item.name)
        );

        return (
            <>
                <Modal show={this.state.popUpCatShow} onHide={this.setPopUpCatDisabled} className="ep-modal-dialog">
                    <Modal.Header closeButton>
                        <Modal.Title>Kategorie ändern:</Modal.Title>
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

    renderCat() {
        let cats = this.props.callback.getCats();
        let catName;
        for ( let i = 0; i < cats.length; i++ ) {
            console.log("Catname", this.state.catIdNew, cats[i].id);
            if ( cats[i].id === this.state.catIdNew ) {
                catName = cats[i].name;
            }
        }
        let but = (
            <Button variant="dark" className="dropdown-toggle dropdown-toggle-split" disabled={true} onClick={this.setPopUpCatEnabled}>
                <span className="sr-only">Toggle Dropdown</span>
            </Button>
        );
        if ( this.state.edit ) {
            but = (
                <Button variant="dark" className="dropdown-toggle dropdown-toggle-split" onClick={this.setPopUpCatEnabled}>
                    <span className="sr-only">Toggle Dropdown</span>
                </Button>
            )
        }

        let all = (
            <InputGroup size="sm" className="mb-3" onClick={this.setPopUpCatEnabled}>
                <FormControl aria-label="Small" className="round-cat dropdown-toggle nav-link" role="button" value={catName} aria-describedby="inputGroup-sizing-sm" disabled={true} />
                <InputGroup.Append>
                    {but}
                </InputGroup.Append>
            </InputGroup>
        );
        if ( this.state.edit ) {
            all = (
                <InputGroup size="sm" className="mb-3 editCat" onClick={this.setPopUpCatEnabled}>
                    <FormControl aria-label="Small" className="round-cat dropdown-toggle nav-link" role="button" value={catName} aria-describedby="inputGroup-sizing-sm" disabled={true} />
                    <InputGroup.Append>
                        {but}
                    </InputGroup.Append>
                </InputGroup>
            );
        }

        return (
            <>
                {all}
            </>
        );
    }

    render() {
        let password = this.getPassword(this.props.id);

        console.log("Start of render", this.state.urlNew);
        let url = this.state.urlNew;

        let catRender = this.renderCat();

        let tagRender = this.renderTag();
        // Password when edited
        let noEdit = (
            <>
                {this.state.show === true ?
                    <FormControl aria-label="Small" aria-describedby="inputGroup-sizing-sm" type={"text"} disabled={true}  onChange={this.changeListener} value={password}/>
                    :
                    <FormControl aria-label="Small" aria-describedby="inputGroup-sizing-sm" type={"password"} disabled={true}  onChange={this.changeListener} value={"*****"}/>
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
                            <h5 className="inline">{this.state.titleNew}</h5>
                            <br className="fixTitle"/>
                            <div className="username inline fixUsername">
                                {this.state.userNew}
                            </div>
                        </Col>
                    </Row>
                </Accordion.Toggle>
                <div className="center-vert setButtonsRight">
                    {this.state.edit === true ? // Copy and GoToWebsite Buttons
                        <>
                            <Button variant="dark" className="buttonSpace" disabled={true} onClick={() => { if ( !this.state.edit ) this.props.callback.copyPass(this.state.id) }}>
                                <img
                                    src={CopyIcon}
                                    alt=""
                                    width="24"
                                    height="24"
                                    className="d-inline-block scaleimg"
                                />
                            </Button>
                            <Button variant="dark" className="buttonSpace" disabled={true} onClick={() => { if ( !this.state.edit ) this.props.callback.goToPage(this.state.urlNew) }}>
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
                            <Button variant="dark" className="buttonSpace" onClick={() => { if ( !this.state.edit ) this.props.callback.copyPass(this.state.id) }}>
                                <img
                                    src={CopyIcon}
                                    alt=""
                                    width="24"
                                    height="24"
                                    className="d-inline-block scaleimg"
                                />
                            </Button>
                            <Button variant="dark" className="buttonSpace" onClick={() => { if ( !this.state.edit ) this.props.callback.goToPage(this.state.urlNew) }}>
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
                                            <FormControl aria-label="Small" aria-describedby="inputGroup-sizing-sm" disabled={true} onChange={this.changeListener} value={this.state.userNew}/>
                                            <Button variant="dark" className="buttonSpaceInline" onClick={() => this.props.callback.copy(this.props.user, dashboardAlerts.showCopyUsernameAlert)}>
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
                                            <FormControl aria-label="Small" aria-describedby="inputGroup-sizing-sm" disabled={true} value={this.state.urlNew} onChange={this.changeListener}/>
                                            <Button variant="dark" className="buttonSpaceInline" onClick={() => this.props.callback.copy(this.state.urlNew, dashboardAlerts.showCopyURLAlert)}>
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
                                    {tagRender}
                                </div>
                                <br/>
                                <div>
                                    <h6>Kategorie</h6>
                                    {catRender}
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
                                                    <Button variant="dark" className="footerButton center-horz" onClick={() => this.setEdit(false, false)}>
                                                        <img
                                                            src={DeleteIcon}
                                                            alt=""
                                                            width="16"
                                                            height="16"
                                                            className="footerButtonImg"
                                                        />
                                                    </Button>
                                                    :
                                                    <Button variant="dark" className="footerButton center-horz" onClick={() => this.setEdit(true, false)}>
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
                                                    <Button variant="dark" className="footerButton center-horz" onClick={() => this.saveEdit()}>
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
                {this.getPopUpCat()}
            </Card>
        );
    }
}
