import React from "react"
import {Card, Col, Dropdown, DropdownButton, Nav, Navbar, NavDropdown} from "react-bootstrap";
import Form from "react-bootstrap/Form";

import Button from "react-bootstrap/Button";
import FormControl from "react-bootstrap/FormControl";
import Row from "react-bootstrap/Row";

import Logo from "../../img/logo/LogoSchnlüsselV2.svg"
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";

// Icons
import AddCat from "../../img/icons/password_add_tag_black.svg";
import EditCat from "../../img/icons/password_edit.svg";
import DeleteCat from "../../img/icons/dashboard_deleteCat.svg";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import InputGroup from "react-bootstrap/InputGroup";
import {dashboardAlerts, dashboardLanguage} from "../dashboard/const/dashboard.enum";

class NavbarEP extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            expanded: false,
            popUpShow: false,
            popUpCatShow: false,
        };


        this.logoutFunc = this.logoutFunc.bind(this);
        this.getPopUp = this.getPopUp.bind(this);
        this.setPopUp = this.setPopUp.bind(this);
        this.setPopUpDisabled = this.setPopUpDisabled.bind(this);
        this.setPopupSave = this.setPopupSave.bind(this);
        this.getPopUp = this.getPopUp.bind(this);
        this.setSettingExpanded = this.setSettingExpanded.bind(this);

        this.setPopUpCatDisabled = this.setPopUpCatDisabled.bind(this);
        this.setPopUpCatEnabled = this.setPopUpCatEnabled.bind(this);
    }


    logoutFunc() {
        console.log(this.props);
        this.props.callback.logoutDash();
    }

    setExpanded() {
        this.setState({
            expanded: !this.state.expanded
        })
    }


    setPopUpDisabled() {
        this.props.callback.cancelSettings();
        this.setState({
            popUpShow: false
        });
    }
    setPopupSave() {
        this.setState({
            popUpShow: false
        });
        this.props.callback.saveSettings();
    }
    setPopUp() {
        this.setState({
            popUpShow: true,
        });
        this.props.callback.setSettingExpandedFalse();
    }

    setSettingExpanded() {
        this.props.callback.setSettingExpanded();
    }

    setPopUpCatDisabled() {
        this.setState({
            popUpCatShow: false
        });
    }

    setPopUpCatEnabled() {
        this.setState({
            popUpCatShow: true
        });
    }



    returnCatBase ( id, name) {
        console.log("Render: " + id + ", " + name);
        return (
            <tr key={id}>
                <td onClick={() => this.changeCat(id)}>
                    {name}
                </td>
            </tr>
        );
    }
    changeCat(id) {
        this.setPopUpCatDisabled();
        this.props.callback.changeCat(id);
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
                        <Modal.Title>Kategorie auswählen:</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="ep-modal-body">
                        <Table striped bordered hover className="ep-modal-table">
                            <tbody>
                                <tr key={0}>
                                    <td onClick={() => this.changeCat(0)}>
                                        Alle Kateogrien
                                    </td>
                                </tr>
                                {finalCats}
                            </tbody>
                        </Table>
                    </Modal.Body>
                </Modal>
            </>
        );
    }


    changeLanguageTo ( to ) {
        this.props.callback.changeLanguageTo(to);
    }


    getPopUp() {
        return (
            <>
                <Modal show={this.state.popUpShow} onHide={this.setPopUpDisabled} className="ep-modal-dialog">
                    <Modal.Header closeButton>
                        <Modal.Title>Einstellungen</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Card.Body>
                            <Row>
                                <Col className="noPadding">
                                    <InputGroup.Prepend className="stickRight">
                                        <InputGroup.Text>Sprache</InputGroup.Text>
                                    </InputGroup.Prepend>
                                </Col>
                                <Col className="noPadding">
                                    <div className="float-right">
                                        <ButtonGroup>
                                            { this.props.language === dashboardLanguage.german ?
                                                <>
                                                    <Button variant="danger" onClick={() => this.changeLanguageTo(dashboardLanguage.german)}>Deutsch</Button>
                                                    <Button variant="secondary" onClick={() => this.changeLanguageTo(dashboardLanguage.english)}>English</Button>
                                                </>
                                                :
                                                <>
                                                    <Button variant="secondary" onClick={() => this.changeLanguageTo(dashboardLanguage.german)}>Deutsch</Button>
                                                    <Button variant="danger" onClick={() => this.changeLanguageTo(dashboardLanguage.english)}>English</Button>
                                                </>
                                            }
                                        </ButtonGroup>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.setPopUpDisabled}>
                            Schließen
                        </Button>
                        <Button variant="danger" onClick={this.setPopupSave}>
                            Änderungen speichern
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }

    render() {
        return (
            <>
                <div className="bg-light boxshadow fixesNavbarParant">
                    <div className="fixedNavbar">
                        <Navbar className="boxshadow" bg="light" expand="lg">
                            <Navbar.Brand href="/dashboard">
                                <img
                                    alt=""
                                    src={Logo}
                                    width="60"
                                    height="60"
                                    className="d-inline-block"
                                />
                                <div className="fixName">{'EasyPass'}</div>
                            </Navbar.Brand>
                            <Navbar.Toggle id="btn-expand" aria-controls="basic-navbar-nav" className="fixedToggle" onClick={this.props.callback.setExpanded}/>
                            <div className="fixedLogoutParent">
                                <div id="logoutBut" className="right">
                                    <Button variant="light" className="logoutBut clickable"
                                            onClick={this.logoutFunc}>
                                        <div id="logoutButIconHover"/>
                                        <div id="logoutButIcon"/>
                                    </Button>
                                </div>
                            </div>
                            <Navbar.Collapse id="basic-navbar-nav" className="search-bar">
                                <div className="search-bar-size">
                                    <FormControl id="search" type="text" placeholder="Search" autoComplete="off" className="search" onChange={this.props.callback.handleSearch}/>
                                </div>
                                <Nav className="mr-auto">
                                    <NavDropdown title={this.props.callback.state.username} onClick={this.setSettingExpanded} className="settingsPopUp dropDown" id="basic-nav-dropdown">
                                        <NavDropdown.Item onClick={this.setPopUp} >Settings</NavDropdown.Item>
                                    </NavDropdown>
                                </Nav>
                            </Navbar.Collapse>
                        </Navbar>
                        <Navbar collapseOnSelect className="catnav catselectSize" expand="lg" bg="dark" variant="dark">
                            <Navbar.Brand className="catName" href="#home">{this.props.callback.getSelectedCatName()}</Navbar.Brand>
                            <Button variant="light" className="catButton round editBut" onClick={() => this.props.callback.showEditCat()}>
                                <img
                                    src={EditCat}
                                    alt=""
                                    width="15"
                                    height="15"
                                    className="d-inline-block"
                                />
                            </Button>
                            <Button variant="light" className="catButton round addBut" onClick={() => this.props.callback.showAddCat()}>
                                <img
                                    src={AddCat}
                                    alt=""
                                    width="15"
                                    height="15"
                                    className="d-inline-block"
                                />
                            </Button>
                            <Button variant="light" className="catButton round delBut" onClick={() => this.props.callback.showDeleteCat()}>
                                <img
                                    src={DeleteCat}
                                    alt=""
                                    width="15"
                                    height="15"
                                    className="d-inline-block"
                                />
                            </Button>
                            <button type="button" aria-label="Toggle navigation" className="toggler navbar-toggler collapsed" onClick={this.setPopUpCatEnabled}>
                                <span className="navbar-toggler-icon"/>
                            </button>
                            {this.getPopUpCat()}
                        </Navbar>
                    </div>
                </div>
                {this.getPopUp()}
            </>
        );
    }

}


export default NavbarEP;