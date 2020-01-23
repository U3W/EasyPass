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
import StringSelector from "../../strings/stings";
import dashboardState from "../dashboard/dashboard.saved.state";
import CopyIcon from "../../img/icons/password_copy_white.svg";
import ResetPass from "./resetPass";

class NavbarEP extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            expanded: false,
            popUpShow: false,
            changePassPopUpShow: true,
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

        this.setChangePopUpDisabled = this.setChangePopUpDisabled.bind(this);
        this.setChangePopUp = this.setChangePopUp.bind(this);


    }




    logoutFunc() {
        //console.log(this.props);
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

    resetPass(pass, newPass) {
        if ( this.props.callback.resetPass(pass, newPass) ) {
            this.setChangePopUpDisabled();
            return true;
        }
        else {
            return false;
        }
    }

    setChangePopUpDisabled() {
        this.setState({
            changePassPopUpShow: false
        });
    }

    setChangePopUp() {
        this.setState({
            changePassPopUpShow: true,
        });
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
        //console.log("Render: " + id + ", " + name);
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
                        <Modal.Title>{StringSelector.getString(this.props.callback.state.language).cats + ":"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="ep-modal-body">
                        <Table striped bordered hover className="ep-modal-table">
                            <tbody>
                                <tr key={0}>
                                    <td onClick={() => this.changeCat(0)}>
                                        {StringSelector.getString(this.props.callback.state.language).catsAllCat}
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
                        <Modal.Title>{StringSelector.getString(this.props.callback.state.language).settings}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Card.Body>
                            <Row>
                                <Col className="noPadding">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text className="fitHoleParent">{StringSelector.getString(this.props.callback.state.language).language}</InputGroup.Text>
                                    </InputGroup.Prepend>
                                </Col>
                                <div className="noPadding">
                                    <div className="float-right">
                                        <ButtonGroup>
                                            { this.props.language === dashboardLanguage.german ?
                                                <>
                                                    <Button className="noLeftBorderRadius" variant="danger" onClick={() => this.changeLanguageTo(dashboardLanguage.german)}>{StringSelector.getString(this.props.callback.state.language).german}</Button>
                                                    <Button variant="secondary" onClick={() => this.changeLanguageTo(dashboardLanguage.english)}>{StringSelector.getString(this.props.callback.state.language).english}</Button>
                                                </>
                                                :
                                                <>
                                                    <Button className="noLeftBorderRadius" variant="secondary" onClick={() => this.changeLanguageTo(dashboardLanguage.german)}>{StringSelector.getString(this.props.callback.state.language).german}</Button>
                                                    <Button variant="danger" onClick={() => this.changeLanguageTo(dashboardLanguage.english)}>{StringSelector.getString(this.props.callback.state.language).english}</Button>
                                                </>
                                            }
                                        </ButtonGroup>
                                    </div>
                                </div>
                            </Row>
                            <Row className="rowMargin">
                                <Col className="noPadding">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text className="fitHoleParent">Change password</InputGroup.Text>
                                    </InputGroup.Prepend>
                                </Col>
                                <div className="noPadding">
                                    <div className="float-right">
                                        <Button variant="danger" className="noLeftBorderRadius" onClick={this.setChangePopUp}>Change</Button>
                                    </div>
                                </div>
                            </Row>
                        </Card.Body>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={this.setPopupSave}>
                            {StringSelector.getString(this.props.callback.state.language).saveSetting}
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
                                    <FormControl id="search" type="text" placeholder={StringSelector.getString(this.props.callback.state.language).searchPlaceholder} autoComplete="off" className="search" onChange={this.props.callback.handleSearch}/>
                                </div>
                                <Nav className="mr-auto">
                                    <NavDropdown title={this.props.callback.state.username} onClick={this.setSettingExpanded} className="settingsPopUp dropDown" id="basic-nav-dropdown">
                                        <NavDropdown.Item onClick={this.setPopUp} >{StringSelector.getString(this.props.callback.state.language).settings}</NavDropdown.Item>
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
                <ResetPass callback={this} show={this.state.changePassPopUpShow}/>
            </>
        );
    }

}


export default NavbarEP;