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

class NavbarEP extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            search: "",
            popUpShow: false,
            isHoveringOverLogout: false
        };

        console.log("Start");
        console.log(this.props);



        this.handleChange = this.handleChange.bind(this);
        this.logoutFunc = this.logoutFunc.bind(this);
        this.getPopUp = this.getPopUp.bind(this);
        this.setPopUp = this.setPopUp.bind(this);
        this.setPopUpDisabled = this.setPopUpDisabled.bind(this);
        this.setPopupSave = this.setPopupSave.bind(this);
        this.getPopUp = this.getPopUp.bind(this);
    }


    handleChange = (e) => {
        this.setState({
            [e.target.id]: e.target.value
        });
    };

    logoutFunc() {
        console.log(this.props);
        this.props.callback.logoutDash();
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
            popUpShow: true
        });
    }
    getPopUp() {
        return (
            <>
                <Modal show={this.state.popUpShow} onHide={this.setPopUpDisabled}>
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
                            <Navbar.Toggle aria-controls="basic-navbar-nav" className="fixedToggle" />
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
                                    <Form inline autoComplete="off">
                                        <FormControl id="search" type="text" placeholder="Search" className="search" onChange={this.handleChange} value={this.state.search}/>
                                    </Form>
                                </div>
                                <Nav className="mr-auto">
                                    <NavDropdown title={this.props.callback.state.username} className="settingsPopUp dropDown" id="basic-nav-dropdown">
                                        <NavDropdown.Item  onClick={this.setPopUp} >Settings</NavDropdown.Item>
                                    </NavDropdown>
                                </Nav>
                            </Navbar.Collapse>

                            {this.getPopUp()}
                        </Navbar>
                    </div>
                </div>
            </>
        );
    }

}


export default NavbarEP;