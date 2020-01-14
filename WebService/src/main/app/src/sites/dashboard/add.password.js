import React from "react";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import {Card, Col, Form} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import "./add.password.css"
// Icons
import GeneratePassIcon from "../../img/icons/generate_password_white.svg";
import ReloadPass from "../../img/icons/generate_reload_white.svg"
import AddTag from "../../img/icons/password_add_tag.svg";
import Row from "react-bootstrap/Row";
import GeneratePass from "./generatepass";

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
            // Popup
            popUpCatShow: false,
            generatePassShow: false,

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
            // Popup
            popUpCatShow: false,
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
                        <Modal.Title>Kategorie ändern:</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="ep-modal-body">
                        <Table striped bordered hover className="ep-modal-table">
                            <tbody>
                                {finalCats}
                                <tr>
                                    <td onClick={() => this.changeCat(0)}>
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

    getCatName() {
        let cats = this.props.callback.getCats();
        let catName;
        if ( this.state.catID === 0 ) {
            return "Keiner Kategorie zugeordnet"
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
                }, () => { if ( this.state.user.length > 0 ) { this.setState({missingPass: false})}});
                break;
            case "url":
                this.setState({
                    url: e.target.value,
                });
                break;
        }
    };

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
        return (
            <>
                <Modal onKeyDown={this.handleKeyevent} show={this.props.callback.getPassAddShow()} onHide={this.dismissPopUp} className="ep-modal-dialog addPassPopUp">
                    <Modal.Header closeButton>
                        <Modal.Title>Passwort hinzufügen:</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="ep-modal-body">
                        <Card.Body>
                            <InputGroup size="lg" className="mb-3">
                                <InputGroup.Prepend>
                                    <InputGroup.Text id="inputGroup-sizing-lg">Titel</InputGroup.Text>
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
                                    <InputGroup.Text id="inputGroup-sizing-sm">User</InputGroup.Text>
                                </InputGroup.Prepend>
                                { this.state.missingUser ?
                                    <FormControl className="text-danger is-invalid" autoComplete="off" id="username" aria-label="Small" aria-describedby="inputGroup-sizing-sm" value={this.state.user} onChange={this.changeInput}/>
                                    :
                                    <FormControl autoComplete="off" id="username" aria-label="Small" aria-describedby="inputGroup-sizing-sm" value={this.state.user} onChange={this.changeInput}/>
                                }
                            </InputGroup>

                            <InputGroup size="sm" className="mb-3">
                                <InputGroup.Prepend>
                                    <InputGroup.Text id="inputGroup-sizing-sm">Password</InputGroup.Text>
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
                                    <InputGroup.Text id="inputGroup-sizing-sm">Website (Login)</InputGroup.Text>
                                </InputGroup.Prepend>
                                <FormControl autoComplete="off" id="url" aria-label="Small" aria-describedby="inputGroup-sizing-sm" value={this.state.url} onChange={this.changeInput}/>
                            </InputGroup>

                            <hr/>
                            <div>
                                <h6>Tags</h6>
                                {this.renderTag()}
                            </div>

                            <div>
                                <h6>Kategorie</h6>
                                <InputGroup size="sm" className="mb-3 editCat" onClick={this.setPopUpCatEnabled}>
                                    <FormControl autoComplete="off" aria-label="Small" className="round-cat dropdown-toggle nav-link" role="button" value={this.getCatName()} aria-describedby="inputGroup-sizing-sm" disabled={true}/>
                                    <InputGroup.Append>
                                        <Button variant="dark" className="dropdown-toggle dropdown-toggle-split" onClick={this.setPopUpCatEnabled}>
                                            <span className="sr-only">Toggle Dropdown</span>
                                        </Button>
                                    </InputGroup.Append>
                                </InputGroup>
                            </div>
                        </Card.Body>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant={"danger"} onClick={this.addPass}>Hinzufügen</Button>
                    </Modal.Footer>
                </Modal>
                {this.getPopUpCat()}
                <GeneratePass callback={this} show={this.state.generatePassShow}/>
            </>
        );
    }

}
