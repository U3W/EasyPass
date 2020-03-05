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
import tabs from "../dashboard/tabs/tab.enum";
import Alert from "react-bootstrap/Alert";
import dashboard, {download} from "../dashboard/dashboard";

class NavbarEP extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            settingsPopUpShow: false,
            changePassPopUpShow: false,
            popUpCatShow: false,
            userKeyPopUp: false,

            show2FAOpt: false,
            show2FAFromDeToAct: false,
            alert2FAShow: false,
        };


        this.logoutFunc = this.logoutFunc.bind(this);
        this.getSettingsPopUp = this.getSettingsPopUp.bind(this);
        this.setSettingsPopUp = this.setSettingsPopUp.bind(this);
        this.setSettingsPopUpDisabled = this.setSettingsPopUpDisabled.bind(this);
        this.setSettingsPopupSave = this.setSettingsPopupSave.bind(this);
        this.getSettingsPopUp = this.getSettingsPopUp.bind(this);
        this.setSettingExpanded = this.setSettingExpanded.bind(this);

        this.setPopUpCatDisabled = this.setPopUpCatDisabled.bind(this);
        this.setPopUpCatEnabled = this.setPopUpCatEnabled.bind(this);

        this.setChangePopUpDisabled = this.setChangePopUpDisabled.bind(this);
        this.setChangePopUp = this.setChangePopUp.bind(this);

        this.generateKeyFile = this.generateKeyFile.bind(this);

        this.setUserKeyPopUpDisabled = this.setUserKeyPopUpDisabled.bind(this);
        this.setUserKeyPopUpEnabled = this.setUserKeyPopUpEnabled.bind(this);

        this.show2FAOption = this.show2FAOption.bind(this);
        this.setShow2FAOptDisabled = this.setShow2FAOptDisabled.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log("Aha", this.props.callback.state.is2FASet, this.props.callback.state.alert2FAShow);
        if ( (this.props.callback.state.is2FASet && this.props.callback.state.alert2FAShow) && !this.state.show2FAFromDeToAct ) {
            this.setState({
                show2FAFromDeToAct: true,
            });
            this.props.callback.generateKeyfile();
        }
        else if ( !this.props.callback.state.is2FASet && this.state.show2FAFromDeToAct ){
            this.setState({
                show2FAFromDeToAct: false,
            });
        }
    }


    logoutFunc() {
        this.props.callback.logoutDash();
    }


    setSettingsPopUpDisabled() {
        this.props.callback.cancelSettings();
        this.setState({
            settingsPopUpShow: false
        });
    }
    setSettingsPopupSave() {
        this.setState({
            settingsPopUpShow: false
        });
        this.props.callback.saveSettings();
    }
    setSettingsPopUp() {
        this.setState({
            settingsPopUpShow: true,
        });
        this.props.callback.setSettingExpandedFalse();
    }

    resetPass(pass, newPass) {
        this.props.callback.resetUserPass(pass, newPass);
        this.setChangePopUpDisabled();
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
        if ( this.props.callback.state.tabselected === tabs.GROUPPASS ) {
            cats = this.props.callback.getCatsForGroup();
        }
        let finalCats = cats.map((item) =>
            this.returnCatBase(item._id, item.name)
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
                                    <td onClick={() => this.changeCat("0")}>
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

    generateKeyFile() {
        this.props.callback.generateKeyfile();
    }

    getSettingsPopUp() {
        return (
            <>
                <Modal show={this.state.settingsPopUpShow} onHide={this.setSettingsPopUpDisabled} className="ep-modal-dialog popUpBehind">
                    <Modal.Header closeButton>
                        <Modal.Title>{StringSelector.getString(this.props.callback.state.language).settings}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Card.Body>
                            <Row>
                                <Col className="noPadding">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text className="fitHoleParent settingsFitSize">{StringSelector.getString(this.props.callback.state.language).language}</InputGroup.Text>
                                    </InputGroup.Prepend>
                                </Col>
                                <div className="noPadding settingsButtonCol">
                                    <ButtonGroup>
                                        { this.props.language === dashboardLanguage.german ?
                                            <>
                                                <Button className="noLeftBorderRadius settingsButtonFixHeight" variant="danger" onClick={() => this.changeLanguageTo(dashboardLanguage.german)}>{StringSelector.getString(this.props.callback.state.language).german}</Button>
                                                <Button className="settingsButtonFixHeight" variant="secondary" onClick={() => this.changeLanguageTo(dashboardLanguage.english)}>{StringSelector.getString(this.props.callback.state.language).english}</Button>
                                            </>
                                            :
                                            <>
                                                <Button className="noLeftBorderRadius settingsButtonFixHeight" variant="secondary" onClick={() => this.changeLanguageTo(dashboardLanguage.german)}>{StringSelector.getString(this.props.callback.state.language).german}</Button>
                                                <Button className="settingsButtonFixHeight" variant="danger" onClick={() => this.changeLanguageTo(dashboardLanguage.english)}>{StringSelector.getString(this.props.callback.state.language).english}</Button>
                                            </>
                                        }
                                    </ButtonGroup>
                                </div>
                            </Row>
                            <hr className="hrSettings"/>
                            <Row className="rowMargin">
                                <Col className="noPadding">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text className="fitHoleParent settingsFitSize">{StringSelector.getString(this.props.callback.state.language).userKeySettings}</InputGroup.Text>
                                    </InputGroup.Prepend>
                                </Col>
                                <div className="noPadding settingsButtonCol">
                                    <Button variant="danger" className="noLeftBorderRadius settingsButtonFixHeight" onClick={this.setUserKeyPopUpEnabled}>{StringSelector.getString(this.props.callback.state.language).userKeyShow}</Button>
                                </div>
                            </Row>
                            <Row className="rowMargin">
                                <Col className="noPadding">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text className="fitHoleParent settingsFitSize">{StringSelector.getString(this.props.callback.state.language).changePass}</InputGroup.Text>
                                    </InputGroup.Prepend>
                                </Col>
                                <div className="noPadding settingsButtonCol">
                                    <Button variant="danger" className="noLeftBorderRadius settingsButtonFixHeight" onClick={this.setChangePopUp}>{StringSelector.getString(this.props.callback.state.language).changePassBut}</Button>
                                </div>
                            </Row>
                            <hr className="hrSettings"/>
                            <Row className="rowMargin">
                                <Col className="noPadding">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text className="fitHoleParent settingsFitSize">{StringSelector.getString(this.props.callback.state.language).settings2FA}</InputGroup.Text>
                                    </InputGroup.Prepend>
                                </Col>
                                <div className="noPadding settingsButtonCol">
                                    <Button variant="danger" className="noLeftBorderRadius settingsButtonFixHeight" onClick={this.show2FAOption}>{StringSelector.getString(this.props.callback.state.language).settings2FAOpen}</Button>
                                </div>
                            </Row>
                        </Card.Body>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={this.setSettingsPopupSave}>
                            {StringSelector.getString(this.props.callback.state.language).saveSetting}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }

    show2FAOption() {
        this.setState({
            show2FAOpt: true,
        });
    }

    setShow2FAOptDisabled() {
        this.setState({
            show2FAOpt: false,
        })
    }

    setUserKeyPopUpDisabled() {
        this.setState({
            userKeyPopUp: false,
        });
    }

    setUserKeyPopUpEnabled() {
        //this.props.callback.reqUserkey();
        this.setState({
            userKeyPopUp: true,
        });
    }

    print2FAAlert() {
        const show = this.props.callback.state.alert2FAShow;
        let text = StringSelector.getString(this.props.callback.state.language).settings2FAChangedSucc;
        if ( this.props.callback.state.alertState === "danger" ) {
            text = StringSelector.getString(this.props.callback.state.language).settings2FAChangedErr;
        }
        return (
            <Alert show={show} variant={this.props.callback.state.alertState} className="center-horz center-vert error fixed-bottom-easypass in-front">
                <p className="center-horz center-vert center-text">
                    {text}
                </p>
            </Alert>
        );
    }

    printChangePassAlert() {
        const show = this.props.callback.state.alertChangePassShow;
        let text = StringSelector.getString(this.props.callback.state.language).settingsChangePassSucc;
        if ( this.props.callback.state.alertState === "danger" ) {
            text = StringSelector.getString(this.props.callback.state.language).settingsChangePassErr;
        }
        return (
            <Alert show={show} variant={this.props.callback.state.alertState} className="center-horz center-vert error fixed-bottom-easypass in-front">
                <p className="center-horz center-vert center-text">
                    {text}
                </p>
            </Alert>
        );
    }

    get2FAPopUp() {
        return (
            <>
                <Modal show={this.state.show2FAOpt} onHide={this.setShow2FAOptDisabled} className="ep-modal-dialog">
                    <Modal.Header closeButton>
                        <Modal.Title>{StringSelector.getString(this.props.callback.state.language).settings2FA}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Card.Body>
                            <Row>
                                <Col className="noPadding">
                                    <InputGroup.Prepend>
                                        { this.props.callback.state.is2FASet ?
                                            <>
                                                <InputGroup.Text className="fitHoleParent settingsFitSize">{StringSelector.getString(this.props.callback.state.language).settings2FACurrA}</InputGroup.Text>
                                            </>
                                            :
                                            <>
                                                <InputGroup.Text className="fitHoleParent settingsFitSize">{StringSelector.getString(this.props.callback.state.language).settings2FACurrD   }</InputGroup.Text>
                                            </>
                                        }
                                    </InputGroup.Prepend>
                                </Col>
                                <div className="noPadding settingsButtonCol">
                                    { this.props.callback.state.is2FASet ?
                                        <>
                                            <Button variant="danger" className="noLeftBorderRadius settingsButtonFixHeight" onClick={() => {this.props.callback.change2FA(false);}}>{StringSelector.getString(this.props.callback.state.language).settings2FADeactivate}</Button>
                                        </>
                                        :
                                        <>
                                            <Button variant="danger" className="noLeftBorderRadius settingsButtonFixHeight" onClick={() => {this.props.callback.change2FA(true);}}>{StringSelector.getString(this.props.callback.state.language).settings2FAActivate}</Button>
                                        </>
                                    }
                                </div>
                            </Row>
                            { this.state.show2FAFromDeToAct  &&
                                <>
                                    <div className="settingsFitSize text-danger infoText">
                                        {StringSelector.getString(this.props.callback.state.language).settings2FAInfo1}<br/>
                                        {StringSelector.getString(this.props.callback.state.language).settings2FAInfo2}<br/>
                                        {StringSelector.getString(this.props.callback.state.language).settings2FAInfo3}
                                    </div>
                                </>
                            }
                            <hr className="hrSettings"/>
                            { this.props.callback.state.is2FASet ?
                                <Row className="rowMargin">
                                    <Col className="noPadding">
                                        <InputGroup.Prepend>
                                            <InputGroup.Text className="fitHoleParent settingsFitSize">{StringSelector.getString(this.props.callback.state.language).genKeyfile}</InputGroup.Text>
                                        </InputGroup.Prepend>
                                    </Col>
                                    <div className="noPadding settingsButtonCol">
                                        <Button variant="danger" disabled={false} className="noLeftBorderRadius settingsButtonFixHeight" onClick={this.generateKeyFile}>{StringSelector.getString(this.props.callback.state.language).genButton}</Button>
                                    </div>
                                </Row>
                                :
                                <Row className="rowMargin">
                                    <Col className="noPadding">
                                        <InputGroup.Prepend>
                                            <InputGroup.Text className="fitHoleParent settingsFitSize">{StringSelector.getString(this.props.callback.state.language).genKeyfile}</InputGroup.Text>
                                        </InputGroup.Prepend>
                                    </Col>
                                    <div className="noPadding settingsButtonCol">
                                        <Button variant="danger" disabled={true} className="noLeftBorderRadius settingsButtonFixHeight">{StringSelector.getString(this.props.callback.state.language).genButton}</Button>
                                    </div>
                                </Row>
                            }
                        </Card.Body>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={this.setShow2FAOptDisabled}>
                            {StringSelector.getString(this.props.callback.state.language).userKeyClose}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }


    getUserKeyPopUp() {
        return (
            <>
                <Modal show={this.state.userKeyPopUp} onHide={this.setUserKeyPopUpDisabled} className="ep-modal-dialog">
                    <Modal.Header closeButton>
                        <Modal.Title>{StringSelector.getString(this.props.callback.state.language).userKeyHead}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Card.Body>
                            <Row>
                                <Col className="noPadding">
                                    <InputGroup>
                                        <InputGroup.Prepend>
                                            <InputGroup.Text>{StringSelector.getString(this.props.callback.state.language).userKey}</InputGroup.Text>
                                        </InputGroup.Prepend>
                                        <FormControl disabled={true} className="noResize" as="textarea" aria-label="With textarea" value={this.props.userKey}/>
                                    </InputGroup>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={this.setUserKeyPopUpDisabled}>
                            {StringSelector.getString(this.props.callback.state.language).userKeyClose}
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
                                    { (this.props.callback.state.tabselected === tabs.GROUPPASS && this.props.callback.state.groupselected === "0") ?
                                        <FormControl id="search" type="text" placeholder={StringSelector.getString(this.props.callback.state.language).searchPlaceholderGroup} autoComplete="off" className="search" onChange={this.props.callback.handleSearchGroup}/>
                                        :
                                        <FormControl id="search" type="text" placeholder={StringSelector.getString(this.props.callback.state.language).searchPlaceholder} autoComplete="off" className="search" onChange={this.props.callback.handleSearch}/>
                                    }
                                </div>
                                <Nav className="mr-auto">
                                    <NavDropdown title={this.props.callback.state.username} onClick={this.setSettingExpanded} className="settingsPopUp dropDown" id="basic-nav-dropdown">
                                        <NavDropdown.Item onClick={this.setSettingsPopUp} >{StringSelector.getString(this.props.callback.state.language).settings}</NavDropdown.Item>
                                    </NavDropdown>
                                </Nav>
                            </Navbar.Collapse>
                        </Navbar>
                        { (this.props.callback.state.tabselected !== tabs.GROUPPASS || this.props.callback.state.groupselected !== "0") &&
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
                        }
                    </div>
                </div>
                {this.getSettingsPopUp()}
                {this.getUserKeyPopUp()}
                {this.get2FAPopUp()}
                {this.print2FAAlert()}
                {this.printChangePassAlert()}
                <ResetPass callback={this} show={this.state.changePassPopUpShow}/>
            </>
        );
    }

}


export default NavbarEP;