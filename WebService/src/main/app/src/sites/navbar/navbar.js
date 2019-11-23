import React from "react"
import {Card, Dropdown, DropdownButton, Nav, Navbar, NavDropdown} from "react-bootstrap";
import Form from "react-bootstrap/Form";

import Button from "react-bootstrap/Button";
import FormControl from "react-bootstrap/FormControl";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import logoutImg from "../../img/icons/logout.svg"

import {login, logout} from "../../action/auth.action";
import {connect} from "react-redux";
import Logo from "../../img/logo/LogoSchnlüsselV2.svg"
import Modal from "react-bootstrap/Modal";
import NavbarVerticalEP from "./navbar.vertcal";
import Table from "react-bootstrap/Table";

class NavbarEP extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            search: "",
            expanded: false,
            settingsExpanded: false,
            popUpShow: false,
            popUpCatShow: false,
            isHoveringOverLogout: false,
        };

        console.log("Start");
        console.log(this.props);



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
        console.log("Dismissed");
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



    getPopUp() {
        return (
            <>
                <Modal show={this.state.popUpShow} onHide={this.setPopUpDisabled} className="ep-modal-dialog">
                    <Modal.Header closeButton>
                        <Modal.Title>Account Settings</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Text</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.setPopUpDisabled}>
                            Close
                        </Button>
                        <Button variant="danger" onClick={this.setPopupSave}>
                            Save Changes
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