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
import NotAvailable from "../../img/icons/password_image_not_available.svg";

import Row from "react-bootstrap/Row";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import Tooltip from "react-bootstrap/Tooltip";
import * as $ from "../../../modules/pouchdb-find/dist/pouchdb.find";
import {Nav, NavDropdown} from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import {dashboardAlerts} from "./const/dashboard.enum";
import GeneratePassIcon from "../../img/icons/generate_password_white.svg";
import GeneratePass from "./generatepass";
import Spinner from "react-bootstrap/Spinner";
import StringSelector from "../../strings/stings";
import RemoveTag from "../../img/icons/password_add_remove_user.svg";


/**
 * @param id: which element in a list f.e. (must be unique, because with this id the collapsible div will be opened then toggled)
 * @param img: a link to the website (f.e. "www.google.com/"). Note that the / at the end is necessary for getting the favicon (Icon on the beginning of the card)
 * @param title: title of this password
 * @param user: username of this password
 * @param pass: password
 * @param url: link to the login page
 * @param userGroupList: List with all users that are allowed to see this password. Only nessessary when dealing with group passwords and only shown for the admin (creater) of this password
 *        - Array: [{name: ..}]
 * @param callback: Link to the dashboard class
 * @param rest
 */
export default class PassLine extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            showCopyAlert: false,
            edit: false,
            editRequest: false,
            groupId: this.props.groupId,
            id: this.props.id,
            rev: this.props.rev,
            passwordNew: undefined,
            userNew: this.props.user,
            titleNew: this.props.title,
            imgSucc: false,
            imgNew: null, // null at the beginning
            urlNew: this.props.url,
            catIdNew: this.props.cat,
            tagNew: this.deepCopyTags(this.props.tag),
            tagAdded: this.setTagAddedRight(this.props.tag),
            popUpCatShow: false,
            // generate popup
            generatePassShow: false,


        };

        this.dismissGeneratePass = this.dismissGeneratePass.bind(this);
        this.openGeneratePass = this.openGeneratePass.bind(this);

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


    correctUrl(imgUrl) {
        let out = "http://"+this.extractHostname(imgUrl);
        if ( out.charAt(out.length-1) !== "/" )
        {
            out += "/"
        }
        return out;
    }

    extractHostname(url) {
        let hostname;
        //find & remove protocol (http, ftp, etc.) and get hostname
        if (url.indexOf("//") > -1) {
            hostname = url.split('/')[2];
        }
        else {
            hostname = url.split('/')[0];
        }

        //find & remove port number
        hostname = hostname.split(':')[0];
        //find & remove "?"
        hostname = hostname.split('?')[0];

        return hostname;
    }


    componentDidMount() {
        function Ping(ip, timeout, callback) {

            if (!this.inUse) {
                this.status = 'unchecked';
                this.inUse = true;
                this.callback = callback;
                this.ip = ip;
                let _that = this;
                this.img = new Image();
                this.img.onload = function () {
                    _that.inUse = false;
                    _that.callback('responded');

                };
                this.img.onerror = function (e) {
                    if (_that.inUse) {
                        _that.inUse = false;
                        _that.callback('responded', e);
                    }

                };
                this.start = new Date().getTime();
                this.img.src = ip;
                this.timer = setTimeout(function () {
                    if (_that.inUse) {
                        _that.inUse = false;
                        _that.callback('timeout');
                    }
                }, timeout);
            }
        }

        /*
        this.setState({
            imgNew: new Image().src = this.correctUrl(this.state.urlNew) + "favicon.ico",
        });*/
        if ( this.state.urlNew.length > 0 ) {
            new Ping(this.correctUrl(this.state.urlNew)  + "favicon.ico", 400, ( status, e ) => {
                if ( status !== "timeout" ) {
                    this.setState({
                        imgSucc: true,
                        imgNew: new Image().src = this.correctUrl(this.state.urlNew) + "favicon.ico",
                    });
                }
                else {
                    this.setState({
                        imgSucc: false,
                    });
                    new Ping(this.correctUrl(this.state.urlNew), 800, ( status, e ) => {
                        if ( status !== "timeout" ) {
                            this.setState({
                                imgSucc: true,
                                imgNew: new Image().src = this.correctUrl(this.state.urlNew) + "favicon.ico",
                            });
                        }
                        else {
                            this.setState({
                                imgSucc: true,
                                imgNew: new Image().src = NotAvailable,
                            });
                        }
                        if ( e !== undefined && e.type === "error") {
                            this.setState({
                                imgSucc: true,
                                imgNew: new Image().src = NotAvailable,
                            });
                        }
                    });
                }
                if ( e !== undefined && e.type === "error") {
                    this.setState({
                        imgSucc: true,
                        imgNew: new Image().src = NotAvailable,
                    });
                }
            }).onerror = ( function (event) {
                
            });

        }
        else {
            this.setState({
                imgSucc: true,
                imgNew: new Image().src = NotAvailable,
            });
        }

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.editRequest === true && this.props.passwordCache !== undefined) {
            this.setEdit(true, false);
        }
    }

    dismissGeneratePass() {
        this.setState({
            generatePassShow: false,
        });
    }

    openGeneratePass() {
        this.setState({
            generatePassShow: true,
        });
    }

    addPassword( pass ) {
        this.setState({
            passwordNew: pass,
        });
        this.dismissGeneratePass();
    }

    setTagAddedRight( tags ) {
        return tags.length > 0;
    }

    deepCopyTags( tags ) {
        if ( tags !== undefined ) {
            let out = [];
            for ( let i = 0; i < tags.length; i++ ) {
                out[i] = JSON.parse(JSON.stringify(tags[i]));
            }
            return out;
        }
        return undefined;
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
            //console.log("Teest");
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

    removeTag( i ) {
        if ( this.state.edit ) {
            if (i < this.state.tagNew.length) {
                let temp = this.state.tagNew;
                temp.splice(i, 1);


                if (this.state.tagNew.length === 0) {
                    this.setState({
                        tagAdded: false,
                    })
                } else {
                    this.setState({
                        tagNew: temp,
                    });
                }
            }
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
        this.props.callback.saveEdit(
            this.state.id, this.state.rev, this.state.userNew, this.state.passwordNew,
            this.state.urlNew, this.state.titleNew, this.state.tagNew, this.state.catIdNew);
    }

    /**
     * Before calling saveEdit, when saving the edited state, setEdit needs to be called first
     * @param changeTo (true|false)
     * @param succ (true|false) success
     */
    setEdit( changeTo, succ ) {
        if ( changeTo ) {
            if (this.state.passwordNew === undefined) {
                if (this.props.passwordCache !== undefined) {
                    this.setState({
                        passwordNew: this.props.passwordCache,
                        editRequest: false,
                        edit: changeTo
                    });
                } else {
                    this.setState({
                        editRequest: true
                    });
                    this.props.callback.getPassForUpdate(this.props.id, this.state.rev);
                }
            }
        }
        else {
            if ( !succ ) {
                this.setState({
                    passwordNew: undefined,
                    editRequest: false,
                    userNew: this.props.user,
                    titleNew: this.props.title,
                    urlNew: this.props.url,
                    imgNew: null, // null at the beginning
                    catIdNew: this.props.cat,
                    tagAdded: this.setTagAddedRight(this.props.tag),
                    tagNew: this.deepCopyTags(this.props.tag),
                });
            }
            this.setState({
                edit: changeTo
            })
        }
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

    /**
     * Starts the whole process thats results in setting the password
     * into the cache.
     * If password is already set, the cache is reseted.
     */
    getPassword() {
        if (this.props.show !== true || this.state.id !== this.props.passwordCacheID) {
            this.props.callback.getPass(this.state.id, this.state.rev);
        } else this.props.callback.resetPass();
    }


    renderTag() {
        let tag = this.state.tagNew; //this.addKeyToTagArray(this.state.tagNew);
        //console.log("TagInRender", tag, this.props.tag);
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
        else {
            for ( let i = 0; i < tag.length; i++ )
            {
                let tagKeys = Object.keys(tag[i]);

                let andBut = "";
                if ( i < tag.length-1) {
                    andBut = (
                        <>
                            <Button variant="dark" className="buttonSpaceInline" onClick={() => this.removeTag(i)}>
                                <img
                                    src={RemoveTag}
                                    alt=""
                                    width="14"
                                    height="14"
                                    className="d-inline-block"
                                />
                            </Button>
                        </>
                    );
                }
                else if ( i === tag.length-1) {
                    andBut = (
                        <>
                            <Button variant="dark" className="buttonSpaceInline notRound" onClick={() => this.removeTag(i)}>
                                <img
                                    src={RemoveTag}
                                    alt=""
                                    width="14"
                                    height="14"
                                    className="d-inline-block"
                                />
                            </Button>
                            <hr className="vertical-button-sep"/>
                        </>
                    );
                }
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
                            {andBut}
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
                        </InputGroup>
                    );
                }
            }
        }
        let key = -1;
        return tagCompArray.map(function (tagComp) {

            //console.log("Tag ups", tagComp);
            key++;

            return (
                <div key={key}>
                    {tagComp}
                </div>
            );
        });
    }

    returnCatBase ( id, name) {
        //console.log("Render Cat: " + id + ", " + name);
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
            this.returnCatBase(item._id, item.name)
        );

        // ToDo sprache anpassen
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
                                <tr>
                                    <td onClick={() => this.changePassCat("0")}>
                                        Keiner Kategorie zuordnen
                                    </td>
                                </tr>
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

        // keiner Kategorie zugeordnet
        if ( this.state.catIdNew === "0" ) {
            catName = "Keiner Kategorie zugeordnet";
        }
        else {
            for ( let i = 0; i < cats.length; i++ ) {
                if ( cats[i]._id === this.state.catIdNew ) {
                    catName = cats[i].name;
                }
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

        //console.log("Start of render", this.state.urlNew);

        let catRender = this.renderCat();

        let tagRender = this.renderTag();
        // Password when edited
        let noEdit = (
            <>
                {(this.props.show === true && this.state.id === this.props.passwordCacheID) ?
                    <FormControl aria-label="Small" aria-describedby="inputGroup-sizing-sm" type={"text"} disabled={true}  onChange={this.changeListener} value={this.props.passwordCache}/>
                    :
                    <FormControl aria-label="Small" aria-describedby="inputGroup-sizing-sm" type={"password"} disabled={true}  onChange={this.changeListener} value={"*****"}/>
                }
                {(this.props.show === true && this.state.id === this.props.passwordCacheID) ?
                    <Button variant="dark" className="buttonSpaceInline notRound" onClick={this.getPassword}>
                        <img
                            src={HideIcon}
                            alt=""
                            width="14"
                            height="14"
                            className="d-inline-block"
                        />
                    </Button>
                    :
                    <Button variant="dark" className="buttonSpaceInline notRound" onClick={this.getPassword}>
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
                <Button variant="dark" className="notRound buttonSpaceInline" onClick={() => this.openGeneratePass()}>
                    <img
                        src={GeneratePassIcon}
                        alt=""
                        width="14"
                        height="14"
                        className="d-inline-block"
                    />
                </Button>
                <hr className="vertical-button-sep"/>
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
        /* <input id="..." type="hidden" value="..." />: Must be at the first position, otherwise the search function wont find it -> exception */
        return (
            <Card className="pass-card" id={this.state.id}>
                <input id="searchInput" type="hidden" value={this.props.title}/>
                <input id="searchInput2" type="hidden" value={this.props.user}/>
                <Accordion.Toggle as={Card.Header} className="clickable center-vert" eventKey={this.props.id}>
                    <Row>
                        <Col sm={1} md={1} lg={1} xs={1} className="fixLogoCol">
                            { this.state.imgSucc ?
                                <img
                                    src={this.state.imgNew}
                                    alt=""
                                    width="24"
                                    height="24"
                                    className="d-inline-block scaleimg fixLogo"
                                />
                                :
                                <div className="d-inline-block scaleimg fixLogo">
                                    <Spinner animation="border" className="spinnerMargin" size="sm" />
                                </div>
                            }

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
                            <Button variant="dark" className="buttonSpace" disabled={true}
                                    onClick={() => { if ( !this.state.edit )
                                        this.props.callback.copyPass(this.state.id, this.state.rev) }}>
                                <img
                                    src={CopyIcon}
                                    alt=""
                                    width="24"
                                    height="24"
                                    className="d-inline-block scaleimg"
                                />
                            </Button>
                            <Button variant="dark" className="buttonSpace" disabled={true}
                                    onClick={() => { if ( !this.state.edit )
                                        this.props.callback.goToPage(this.state.urlNew, this.state.id, this.state.rev) }}>
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
                            <>
                                {['bottom'].map(placement => (
                                    <OverlayTrigger
                                        key={placement}
                                        placement={placement}
                                        overlay={
                                            <Tooltip id={`tooltip-${placement}`}>
                                                {StringSelector.getString(this.props.callback.state.language).lineCopyPass}
                                            </Tooltip>
                                        }
                                    >
                                        <Button variant="dark" className="buttonSpace" onClick={() => {
                                            if ( !this.state.edit ) this.props.callback.copyPass(this.state.id, this.state.rev) }}>
                                            <img
                                                src={CopyIcon}
                                                alt=""
                                                width="24"
                                                height="24"
                                                className="d-inline-block scaleimg"
                                            />
                                        </Button>
                                    </OverlayTrigger>
                                ))}
                            </>
                            <>
                                {['bottom'].map(placement => (
                                    <OverlayTrigger
                                        key={placement}
                                        placement={placement}
                                        overlay={
                                            <Tooltip id={`tooltip-${placement}`}>
                                                {StringSelector.getString(this.props.callback.state.language).lineCopyPassGoTo}
                                            </Tooltip>
                                        }
                                    >
                                        { this.state.urlNew.length === 0 ?
                                            <Button variant="dark" className="buttonSpace" disabled={true} onClick={() => { if ( !this.state.edit && this.state.urlNew.length > 0 )  this.props.callback.goToPage(this.state.urlNew, this.state.id, this.state.rev) }}>
                                                <img
                                                    src={GoToIcon}
                                                    alt=""
                                                    width="24"
                                                    height="24"
                                                    className="d-inline-block scaleimg"
                                                />
                                            </Button>
                                            :
                                            <Button variant="dark" className="buttonSpace" onClick={() => { if ( !this.state.edit )  this.props.callback.goToPage(this.state.urlNew, this.state.id, this.state.rev) }}>
                                                <img
                                                    src={GoToIcon}
                                                    alt=""
                                                    width="24"
                                                    height="24"
                                                    className="d-inline-block scaleimg"
                                                />
                                            </Button>
                                        }

                                    </OverlayTrigger>
                                ))}
                            </>
                        </>
                    }
                </div>
                <Accordion.Collapse eventKey={this.props.id}>
                    <>
                        <Card.Body onChange={(e) => {
                        }}>
                            <Card.Title>
                            {this.state.edit === true ? // Title
                                <InputGroup size="lg">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="inputGroup-sizing-lg">{StringSelector.getString(this.props.callback.state.language).lineTitle}</InputGroup.Text>
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
                                        <InputGroup.Text id="inputGroup-sizing-sm">{StringSelector.getString(this.props.callback.state.language).lineUser}</InputGroup.Text>
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
                                        <InputGroup.Text id="inputGroup-sizing-sm">{StringSelector.getString(this.props.callback.state.language).linePass}</InputGroup.Text>
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
                                        <Button variant="dark" className="buttonSpaceInline " disabled={false} onClick={() => {
                                            this.props.callback.copyPass(this.state.id, this.state.rev);
                                        }}>
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
                                        <InputGroup.Text id="inputGroup-sizing-sm">{StringSelector.getString(this.props.callback.state.language).lineWebsite}</InputGroup.Text>
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
                                    <h6>{StringSelector.getString(this.props.callback.state.language).lineTags}</h6>
                                    {tagRender}
                                </div>
                                <br/>
                                <div>
                                    <h6>{StringSelector.getString(this.props.callback.state.language).lineCat}</h6>
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
                                                            {StringSelector.getString(this.props.callback.state.language).lineEditCancle}
                                                        </Tooltip>
                                                        :
                                                        <Tooltip id={`tooltip-${placement}`}>
                                                            {StringSelector.getString(this.props.callback.state.language).lineEdit}
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
                                                        {StringSelector.getString(this.props.callback.state.language).lineEditSave}
                                                    </Tooltip>
                                                    :
                                                    <Tooltip id={`tooltip-${placement}`}>
                                                        {StringSelector.getString(this.props.callback.state.language).lineDel}
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
                                                    <Button variant="dark" className="footerButton center-horz"
                                                        onClick={() =>
                                                            this.props.callback.deletePass(this.state.id, this.state.rev)}>
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
                <GeneratePass callback={this} show={this.state.generatePassShow}/>
            </Card>
        );
    }
}
