import React from "react";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import {Card, Col, Form} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";

import "./add.password.css"
// Icons
import GeneratePassIcon from "../../img/icons/generate_password_white.svg";
import ReloadPass from "../../img/icons/generate_reload_white.svg"
import AddTag from "../../img/icons/password_add_tag.svg";
import DelUserGroup from "../../img/icons/password_add_remove_urser.svg";
import Row from "react-bootstrap/Row";
import GeneratePass from "./generatepass";
import StringSelector from "../../strings/stings";
import tabs from "./tabs/tab.enum";

export default class AddPassword extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            title: "",
            user: "",
            pass: "",
            url: "",
            tagAdded: false,
            tag: [{"":""}],
            catID: 0,

            userGroupAdd: "",
            userGroupList: [],
            // Popup
            popUpCatShow: false,
            generatePassShow: false,
            popUpGroupError: false,
            groupErrTyp: 0,

            // errors / fields
            missingTitle: false,
            missingUser: false,
            missingPass: false,

        };

        this.dismissGeneratePass = this.dismissGeneratePass.bind(this);
        this.openGeneratePass = this.openGeneratePass.bind(this);

        this.dismissPopUp = this.dismissPopUp.bind(this);
        this.renderTag = this.renderTag.bind(this);
        this.addTag = this.addTag.bind(this);
        this.getCatName = this.getCatName.bind(this);

        // popup
        this.setPopUpCatEnabled = this.setPopUpCatEnabled.bind(this);
        this.setPopUpCatDisabled = this.setPopUpCatDisabled.bind(this);
        this.getPopUpCat = this.getPopUpCat.bind(this);
        this.getCatName = this.getCatName.bind(this);

        this.changeCat = this.changeCat.bind(this);

        this.handleKeyevent = this.handleKeyevent.bind(this);
        this.addPass = this.addPass.bind(this);

        this.addUserToGroupAcc = this.addUserToGroupAcc.bind(this);
        this.removeUserFromGroup = this.removeUserFromGroup.bind(this);
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
            pass: pass,
        });
        this.dismissGeneratePass();
    }

    dismissPopUp() {
        this.resetState();
        this.props.callback.dismissAddPass();
    }

    resetState() {
        this.setState({
            title: "",
            user: "",
            pass: "",
            url: "",
            tagAdded: false,
            tag: [{"":""}],
            catID: 0,

            userGroupAdd: "",
            userGroupList: [],
            // Popup
            popUpCatShow: false,
            generatePassShow: false,
            popUpGroupError: false,
            groupErrTyp: 0,

            // errors / fields
            missingTitle: false,
            missingUser: false,
            missingPass: false,
        })
    }


    changeTagListener (key, value, i, e ) {
        if ( this.state.tagAdded ) {
            // just tags
            let tagNew = this.state.tag;
            //console.log("Thisss", tagNew, "key", key);
            if (e.target.id.length > 8) {
                // tagValue + i
                if (e.target.id.includes("tagValue")) {

                    tagNew[i][key] = e.target.value;
                    this.setState({
                        tag: tagNew
                    });
                }
            } else if (e.target.id.length > 6) {
                // tagKey + i

                if (e.target.id.includes("tagKey")) {
                    tagNew[i][e.target.value] = tagNew[i][key];
                    delete tagNew[i][key];

                    this.setState({
                        tag: tagNew
                    })
                }
            }
        }
    }

    checkIfGroupUserAlrAdded( user ) {
        for ( let i = 0; i < this.state.userGroupList.length; i++ ) {
            if ( this.state.userGroupList[i].name === user ) {
                return true;
            }
        }
        return false;
    }

    addUserToGroupAcc() {
        if ( this.state.userGroupAdd.length > 0 ) {
            if ( this.props.callback.checkIfUserExists(this.state.userGroupAdd)) {
                if ( this.checkIfGroupUserAlrAdded(this.state.userGroupAdd) ) {
                    this.setState({
                        popUpGroupError: true,
                        groupErrTyp: 1,
                    })
                }
                else {
                    let id = 0;
                    if ( this.state.userGroupList.length > 0 ) {
                        id = this.state.userGroupList[this.state.userGroupList.length-1].id++;
                    }
                    let arr = this.state.userGroupList;
                    arr.push({id: id, name: this.state.userGroupAdd });
                    this.setState({
                        popUpGroupError: false,
                        groupErrTyp: 0,
                        userGroupList: arr,
                        userGroupAdd: "",
                    });
                }
            }
            else {
                this.setState({
                    popUpGroupError: true,
                    groupErrTyp: 0,
                })
            }
        }
    }

    addTag() {
        if ( !this.state.tagAdded ) {
            this.setState({
                tagAdded: true,
            });
        }
        else {
            let tag = this.state.tag;
            tag[tag.length] = {"": ""};
            this.setState({
                tag: tag,
            });
        }
    }

    renderTag() {
        let tag = this.state.tag;
        let tagCompArray = [];

        for ( let i = 0; i < tag.length; i++ )
        {
            let tagKeys = Object.keys(tag[i]);
            let but = "";
            if ( i === tag.length-1) {
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
            tagCompArray[i] = (
                <InputGroup size="sm" className="mb-3">
                    <FormControl autoComplete="off" id={"tagKey" + i } className="" aria-label="Small" aria-describedby="inputGroup-sizing-sm" disabled={!this.state.tagAdded} value={tagKeys[0]} onChange={(e) => this.changeTagListener(tagKeys[0], tag[i][tagKeys[0]], i, e)} />
                    <FormControl autoComplete="off" id={"tagValue" + i } aria-label="Small" aria-describedby="inputGroup-sizing-sm" disabled={!this.state.tagAdded} value={tag[i][tagKeys[0]]} onChange={(e) => this.changeTagListener(tagKeys[0], tag[i][tagKeys[0]], i, e)} />
                    {but}
                </InputGroup>
            );

        }
        let key = -1;
        return tagCompArray.map(function (tagComp) {
            key++;
            return (
                <div key={key}>
                    {tagComp}
                </div>
            );
        });
    }


    changeCat(id) {
        this.setState({
            catID: id,
            popUpCatShow: false,
        });
    }

    returnCatBase ( id, name) {
        return (
            <tr key={id}>
                <td onClick={() => this.changeCat(id)}>
                    {name}
                </td>
            </tr>
        );
    }

    setPopUpCatDisabled() {
        this.setState({
            popUpCatShow: false,
        });
    }

    setPopUpCatEnabled()  {
        this.setState({
            popUpCatShow: true,
        });
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
                        <Modal.Title>{StringSelector.getString(this.props.callback.state.language).addPassCatChange}:</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="ep-modal-body">
                        <Table striped bordered hover className="ep-modal-table">
                            <tbody>
                                {finalCats}
                                <tr>
                                    <td onClick={() => this.changeCat(0)}>
                                        {StringSelector.getString(this.props.callback.state.language).addPassCatNoCat}
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </Modal.Body>
                </Modal>
            </>
        );
    }

    getCatName() {
        let cats = this.props.callback.getCats();
        let catName;
        if ( this.state.catID === 0 ) {
            return StringSelector.getString(this.props.callback.state.language).addPassCatNoCat
        }
        else {
            for ( let i = 0; i < cats.length; i++ ) {
                if ( cats[i].id === this.state.catID ) {
                    catName = cats[i].name;
                }
            }
        }

        return catName
    }


    changeInput = (e) => {
        switch (e.target.id) {
            case "title":
                this.setState({
                    title: e.target.value
                }, () => { if ( this.state.title.length > 0 ) { this.setState({missingTitle: false})}});
                break;
            case "username":
                this.setState({
                    user: e.target.value,
                }, () => { if ( this.state.user.length > 0 ) { this.setState({missingUser: false})}});
                break;
            case "password":
                this.setState({
                   pass: e.target.value,
                }, () => { if ( this.state.pass.length > 0 ) { this.setState({missingPass: false})}});
                break;
            case "url":
                this.setState({
                    url: e.target.value,
                });
                break;
            case "userGroupAdd":
                this.setState({
                    userGroupAdd: e.target.value,
                }, () => { if ( this.state.popUpGroupError && this.state.userGroupAdd.length > 0) { this.setState({popUpGroupError: false})}});
                break;
        }
    };

    removeUserFromGroup( id ) {
        let arr = this.state.userGroupList;
        for ( let i = 0; i < arr.length; i++ ) {
            if ( arr[i].id === id){
                arr.splice(i,1);
            }
        }
        this.setState({
            userGroupList: arr,
        });
    }

    activeGroupError( type ) {
        this.setState({
            popUpGroupError: true,
            groupErrTyp: type
        })
    }

    getGroupErrorMsg() {
        if ( this.state.popUpGroupError ) {
            let err = StringSelector.getString(this.props.callback.state.language).addPassUserNotFound;
            if ( this.state.groupErrTyp === 1 ) {
                err = StringSelector.getString(this.props.callback.state.language).addPassUserAlready;
            }
            return (
                <p className="text-danger fixErrorMsg">{err}</p>
            );
        }
    }

    getVisibilityTable() {
        let key = -1;
        let elms;
        if ( this.state.userGroupList.length === 0 ) {
            elms = StringSelector.getString(this.props.callback.state.language).addPassUserVisNon;
            return (
                <>
                    <div className="visMargin">
                        <h6 className="noMarginBottom">{StringSelector.getString(this.props.callback.state.language).addPassUserVis}</h6>
                        <i>{StringSelector.getString(this.props.callback.state.language).addPassUserVis2}</i>
                    </div>
                    - {elms}
                </>
            );
        }
        else {
            let elmsArray = [];
            for ( let i = 0; i < this.state.userGroupList.length; i++ ) {
                const item = this.state.userGroupList[i];
                item.name = item.name + " ";
                let tdClass = "";
                if ( i === 0 ) {
                    tdClass += "topRound";
                }
                if ( i === this.state.userGroupList.length-1) {
                    tdClass += " botRound";
                }
                elmsArray[i] = (
                    <td className={tdClass}>
                        {item.name}
                        <button type="button" className="close userRemove" onClick={() => this.removeUserFromGroup(item.id)}>
                            <span aria-hidden="true" >×</span>
                            <span className="sr-only">Close</span>
                        </button>
                    </td>
                );
            }

            elms = elmsArray.map(function(item) {
                key++;
                return (
                    <tr key={key}>
                        {item}
                    </tr>
                );
            });

            return (
                <>
                    <div className="visMargin">
                        <h6 className="noMarginBottom">{StringSelector.getString(this.props.callback.state.language).addPassUserVis}</h6>
                        <i>{StringSelector.getString(this.props.callback.state.language).addPassUserVis2}</i>
                    </div>
                    <div className="roundDiv">
                        <Table striped hover size="sm" className="noMarginBottom roundtable">
                            <tbody>
                            {elms}
                            </tbody>
                        </Table>
                    </div>
                </>
            );
        }



    }

    handleKeyevent(event) {
        if (event.keyCode === 13 )
        {
            // Enter
            this.addPass();
        }
    }

    addPass() {
        if ( this.state.user.length > 0 && this.state.title.length > 0 && this.state.pass.length > 0) {
            this.props.callback.addPass(this.state.user, this.state.pass, this.state.url, this.state.title, this.state.catID, this.state.tag);
            this.resetState();
        }
        else {
            // Error
            if ( this.state.user.length === 0 ) {
                this.setState({
                    missingUser: true,
                });
            }
            if ( this.state.title.length === 0 ) {
                this.setState({
                    missingTitle: true,
                });
            }
            if ( this.state.pass.length === 0 ) {
                this.setState({
                    missingPass: true,
                });
            }
        }
    }


    render() {
        let userClass = "";
        let userComp = "mb-3";
        if ( this.state.popUpGroupError ) {
            userClass = "is-invalid text-danger";
            userComp = "mb-3 errorMargin";
        }
        return (
            <>
                <Modal onKeyDown={this.handleKeyevent} show={this.props.callback.getPassAddShow()} onHide={this.dismissPopUp} className="ep-modal-dialog addPassPopUp">
                    <Modal.Header closeButton>
                        <Modal.Title>{StringSelector.getString(this.props.callback.state.language).addPass}:</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="ep-modal-body">
                        <Card.Body>
                            <InputGroup size="lg" className="mb-3">
                                <InputGroup.Prepend>
                                    <InputGroup.Text id="inputGroup-sizing-lg">{StringSelector.getString(this.props.callback.state.language).addPassTitle}</InputGroup.Text>
                                </InputGroup.Prepend>
                                { this.state.missingTitle ?
                                    <FormControl className="text-danger is-invalid" autoComplete="off" id="title" aria-label="Large" aria-describedby="inputGroup-sizing-sm" value={this.state.title} onChange={this.changeInput}/>
                                    :
                                    <FormControl autoComplete="off" id="title" aria-label="Large" aria-describedby="inputGroup-sizing-sm" value={this.state.title} onChange={this.changeInput}/>
                                }
                            </InputGroup>
                            <hr/>
                            <InputGroup size="sm" className="mb-3">
                                <InputGroup.Prepend>
                                    <InputGroup.Text id="inputGroup-sizing-sm">{StringSelector.getString(this.props.callback.state.language).addPassUser}</InputGroup.Text>
                                </InputGroup.Prepend>
                                { this.state.missingUser ?
                                    <FormControl className="text-danger is-invalid" autoComplete="off" id="username" aria-label="Small" aria-describedby="inputGroup-sizing-sm" value={this.state.user} onChange={this.changeInput}/>
                                    :
                                    <FormControl autoComplete="off" id="username" aria-label="Small" aria-describedby="inputGroup-sizing-sm" value={this.state.user} onChange={this.changeInput}/>
                                }
                            </InputGroup>

                            <InputGroup size="sm" className="mb-3">
                                <InputGroup.Prepend>
                                    <InputGroup.Text id="inputGroup-sizing-sm">{StringSelector.getString(this.props.callback.state.language).addPassPass}</InputGroup.Text>
                                </InputGroup.Prepend>
                                { this.state.missingPass ?
                                    <FormControl className="text-danger is-invalid" autoComplete="off" id="password" aria-label="Small" aria-describedby="inputGroup-sizing-sm" value={this.state.pass} onChange={this.changeInput}/>
                                    :
                                    <FormControl autoComplete="off" id="password" aria-label="Small" aria-describedby="inputGroup-sizing-sm" value={this.state.pass} onChange={this.changeInput}/>
                                }
                                <Button variant="dark" className="buttonSpaceInline" onClick={() => this.openGeneratePass()}>
                                    <img
                                        src={GeneratePassIcon}
                                        alt=""
                                        width="14"
                                        height="14"
                                        className="d-inline-block"
                                    />
                                </Button>
                            </InputGroup>

                            <InputGroup size="sm" className="mb-3">
                                <InputGroup.Prepend>
                                    <InputGroup.Text id="inputGroup-sizing-sm">{StringSelector.getString(this.props.callback.state.language).addPassWebsite}</InputGroup.Text>
                                </InputGroup.Prepend>
                                <FormControl autoComplete="off" id="url" aria-label="Small" aria-describedby="inputGroup-sizing-sm" value={this.state.url} onChange={this.changeInput}/>
                            </InputGroup>

                            <hr/>
                            <div>
                                <h6>{StringSelector.getString(this.props.callback.state.language).addPassTags}</h6>
                                {this.renderTag()}
                            </div>

                            <div>
                                <h6>{StringSelector.getString(this.props.callback.state.language).addPassCat}</h6>
                                <InputGroup size="sm" className="mb-3 editCat" onClick={this.setPopUpCatEnabled}>
                                    <FormControl autoComplete="off" aria-label="Small" className="round-cat dropdown-toggle nav-link" role="button" value={this.getCatName()} aria-describedby="inputGroup-sizing-sm" disabled={true}/>
                                    <InputGroup.Append>
                                        <Button variant="dark" className="dropdown-toggle dropdown-toggle-split" onClick={this.setPopUpCatEnabled}>
                                            <span className="sr-only">Toggle Dropdown</span>
                                        </Button>
                                    </InputGroup.Append>
                                </InputGroup>
                            </div>
                            { this.props.callback.state.tabselected === tabs.GROUPPASS &&
                                <>
                                    <hr/>
                                    <h6>{StringSelector.getString(this.props.callback.state.language).addPassVis}</h6>
                                    <InputGroup size="sm" className={userComp}>
                                        <InputGroup.Prepend>
                                            <InputGroup.Text id="inputGroup-sizing-sm">{StringSelector.getString(this.props.callback.state.language).addPassUserTag}</InputGroup.Text>
                                        </InputGroup.Prepend>
                                        <FormControl className={userClass} autoComplete="off" id="userGroupAdd" aria-label="Small" aria-describedby="inputGroup-sizing-sm" value={this.state.userGroupAdd} placeholder={StringSelector.getString(this.props.callback.state.language).addPassUserInpPlaceholder} onChange={this.changeInput}/>
                                        <InputGroup.Append>
                                            <Button variant="dark" onClick={this.addUserToGroupAcc}>
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
                                    {this.getGroupErrorMsg()}
                                    {this.getVisibilityTable()}
                                </>
                            }
                        </Card.Body>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant={"danger"} onClick={this.addPass}>{StringSelector.getString(this.props.callback.state.language).addPassAdd}</Button>
                    </Modal.Footer>
                </Modal>
                {this.getPopUpCat()}
                <GeneratePass callback={this} language={this.props.callback.state.language} show={this.state.generatePassShow}/>
            </>
        );
    }

}



