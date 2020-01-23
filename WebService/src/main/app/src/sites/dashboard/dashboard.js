import React from "react";
import {Button, Col, Row} from "react-bootstrap";
import NavbarEP from "../navbar/navbar";
import "../navbar/navbar.css";
import "./dashboard.css";
import {connect} from "react-redux";
import {login, logout} from "../../action/auth.action";
import NavbarVerticalEP2 from "../navbar/navbar.vertical.v2";
import IndicatorSide from "../../network/network.indicator.sidebar";
import tabs from "./tabs/tab.enum";
import PrivatePassword from "./tabs/private.password";
import GroupPassword from "./tabs/group.password";
import MockPasswords from "./MockPasswords";
import PassLine from "./line.temp";
import {
    changeLanguage,
    saveCat, saveSidebarClosed,
    saveTab
} from "../../action/dashboard.action";
import dashboardState from "./dashboard.saved.state"
import Alert from "react-bootstrap/Alert";
import {dashboardAlerts, dashboardLanguage} from "./const/dashboard.enum";
import AddPassword from "../dashboard/add.password"
// Icons
import AddPass from "../../img/icons/password_add_pass.svg";
import Undo from "../../img/icons/password_delete_undo_blue.svg"

import AddCategory from "./add.cat";
import EditCategory from "./edit.cat";
import DeleteCategory from "./delete.cat";
class Dashboard extends React.Component {

    constructor(props){
        super(props);

        // check storage
        //this.fixStorage();


        // Status holen
        let cat;
        let tab = dashboardState.getTab();
        if ( tab === tabs.PRIVPASS )
        {
            console.log("Priv");
            cat = dashboardState.getCatPriv();
        }
        else {
            console.log("Group");
            cat = dashboardState.getCatGroup();
        }

        this.state = {
            // language
            language: dashboardState.getSelectedLanguage(), // 0 - Deutsch, 1 - English

            search: "",
            username: "Username",
            tabselected: tab, // tabs.PRIVPASS
            catselected: cat, //JSON.parse(localStorage.getItem(dashboardConst.catselectedPriv)),
            expanded: false,
            settingsExpanded: false,
            // alerts
            showCopyAlert: false,
            showCopyUsernameAlert: false,
            showCopyURLAlert: false,
            showAddedPass: false,
            showEditedPass: false,
            showAddedCat: false,
            showEditedCat: false,
            // alert state
            alertState: "success",
            // cat add
            popUpAddCatShow: false,
            // cat edit
            popUpEditCatShow: false,
            // cat delete
            showDeleteCatAlert: false,
            // password add
            popUpAddPassShow: false,
            // password delete
            showDeletePassAlert: false,

            // for the undo delete
            currentCatDelete: [],
            currentPassDelete: -1,
            // with, height
            width: 0,
            height: 0,
            // sidebar
            sidebarClosed: dashboardState.getSidebarClosed(),
        };

        this.handleSearch = this.handleSearch.bind(this);
        this.setExpanded = this.setExpanded.bind(this);
        this.logoutDash = this.logoutDash.bind(this);
        this.getTab = this.getTab.bind(this);
        this.getCats = this.getCats.bind(this);
        this.changeCat = this.changeCat.bind(this);
        this.changeTab = this.changeTab.bind(this);
        this.dismissCopy = this.dismissCopy.bind(this);
        this.saveEdit = this.saveEdit.bind(this);
        this.renderCat = this.renderCat.bind(this);
        this.stopDelete = this.stopDelete.bind(this);
        this.resetSettingsExpanded = this.resetSettingsExpanded.bind(this);
        // Popups
        this.dismissAddCat = this.dismissAddCat.bind(this);
        this.showAddCat = this.showAddCat.bind(this);
        this.getCatAddShow = this.getCatAddShow.bind(this);
        this.showAddPass = this.showAddPass.bind(this);
        this.dismissAddPass = this.dismissAddPass.bind(this);
        this.getPassAddShow = this.getPassAddShow.bind(this);


        // WindowDimensions
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions() {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    }


    changeLanguageTo( to ) {
        this.setState({
            language: to
        });
    }


    renderCat() {
        let cats = this.getCats();
        let selectedCat = this.state.catselected;
        console.log("Cats:", cats);
        //console.log("Selected cat: "+ selectedCat);
        if ( selectedCat === 0 )
        {
            let passwords = this.renderLines(cats);
            let passwordsSonst = this.renderLinesSonstige();
            console.log("Cats: Pass:", passwordsSonst, passwords);
            let final = cats.map(function (cat) {
                return (
                    <div key={cat.id} >
                        <strong>{cat.name}</strong>
                        {cat.desc.length === 0 ?
                            ""
                            :
                            <br/>
                        }
                        {cat.desc}
                        <hr/>
                        {passwords[cat.id]}
                    </div>
                );
            });

            let notAddedToCat = (
                <div>
                    <strong>Nicht zugeordnet</strong>
                    <br/>
                    Hier befinden sich alle Passwörter, die keine Kategorie zugeordnet wurden
                    <hr/>
                    {passwordsSonst[0]}
                </div>
            );

            if ( passwordsSonst[0].length === 0 ) {
                notAddedToCat = "";
            }

            return (
                <>
                    <h5>Alle Kategorien</h5>
                    <hr/>
                    {final}
                    {notAddedToCat}
                </>
            );

        }
        else {
            let cat = cats[selectedCat-1];
            let passwords = this.renderLines([cat]);
            return (
                <div>
                    <h5>{cat.name}</h5>
                    {cat.desc}
                    <hr/>
                    {passwords[cat.id]}
                </div>
            );
        }
    }

    getPassword( id ) {
        // TODO Mockobjekt
        return MockPasswords.getPassword(id);
    }


    addCallback( catData ) {

        for (let i = 0; i < catData.length; i++ ) {
            catData[i]["callback"] = this;
        }

        return catData;
    }

    renderLinesSonstige() {
        let passwords = {};
        let selectedTab = this.state.tabselected;
        //TODO mocking Object
        let catData = MockPasswords.getCatData(0, selectedTab);
        // add callback to array
        catData = this.addCallback(catData);
        passwords[0] = catData.map(function (singlePass) {
            console.log("Heyjooo", singlePass.tabID, selectedTab);
            if ( singlePass.tabID === selectedTab  )
            {
                return (
                    <PassLine key={singlePass.id} tag={singlePass.tag} id={singlePass.id} cat={singlePass.cat} title={singlePass.title} user={singlePass.user} pass={singlePass.pass} url={singlePass.url} callback={singlePass.callback}/>
                );
            }
        });
        return passwords;
    }

    renderLines(cats) {
        console.log("RenderLines", cats);
        let passwords = {};
        for ( let i = 0; i < cats.length; i++ ) {
            //out += <b>{cats[i].name}</b>
            let catId = cats[i].id;
            //TODO mocking Object
            let catData = MockPasswords.getCatData(catId, this.state.tabselected);
            // add callback to array
            catData = this.addCallback(catData);
            passwords[catId] = catData.map(function (singlePass) {
                return (
                    <PassLine key={singlePass.id} tag={singlePass.tag} id={singlePass.id} cat={singlePass.cat} title={singlePass.title} user={singlePass.user} pass={singlePass.pass} url={singlePass.url} callback={singlePass.callback}/>
                );
            })
        }
        return passwords;
    }


    printCopy() {
        const show = this.state.showCopyAlert;
        let succ = "Passwort wurde in die Zwischenablage kopiert!";
        let err = "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut!";
        return (
            <Alert show={show} variant={this.state.alertState} className="center-horz center-vert error fixed-top-easypass in-front">
                <p className="center-horz center-vert center-text">
                    {this.state.alertState === "success" ?
                        succ
                        :
                        err
                    }
                </p>
            </Alert>
        );
    }


    printURL() {
        const show = this.state.showCopyURLAlert;
        return (
            <Alert show={show} variant="success" className="center-horz center-vert error fixed-top-easypass in-front">
                <p className="center-horz center-vert center-text">
                    URL wurde in die Zwischenablage kopiert!
                </p>
            </Alert>
        );
    }

    printAddCat() {
        const show = this.state.showAddedCat;
        let succ = "Kategorie hinzugefügt";
        let err = "Beim Hinzufügen der Kategorie ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut!";
        return (
            <Alert show={show} variant={this.state.alertState} className="center-horz center-vert error fixed-top-easypass in-front">
                <p className="center-horz center-vert center-text">
                    { this.state.alertState === "success" ?
                        succ
                        :
                        err
                    }
                </p>
            </Alert>
        );
    }

    printEditCat() {
        const show = this.state.showEditedCat;
        let succ = "Bearbeitete Kategorie gespeichert";
        let err = "Beim Bearbeiten ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut!";
        return (
            <Alert show={show} variant={this.state.alertState} className="center-horz center-vert error fixed-top-easypass in-front">
                <p className="center-horz center-vert center-text">
                    {this.state.alertState === "success" ?
                        succ
                        :
                        err
                    }
                </p>
            </Alert>
        );
    }

    printEditPass() {
        const show = this.state.showEditedPass;
        let succ = "Bearbeitetes Password gespeichert";
        let err = "Beim Bearbeiten des Passworts ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut!";
        return (
            <Alert show={show} variant={this.state.alertState} className="center-horz center-vert error fixed-top-easypass in-front">
                <p className="center-horz center-vert center-text">
                    {this.state.alertState === "success" ?
                        succ
                        :
                        err
                    }
                </p>
            </Alert>
        );
    }

    printDeleteCat() {
        const show = this.state.showDeleteCatAlert;
        let succ;
        let err;
        if ( this.state.currentCatDelete.length > 1 ) {
            succ = "Kateogrien gelöscht ";
            err = "Beim Löschen der Kategorien ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut!";
        }
        else {
            succ = "Kateogrie gelöscht ";
            err = "Beim Löschen der Kategorie ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut!";
        }
        return (
            <Alert show={show} variant={this.state.alertState} className="center-horz center-vert error fixed-top-easypass in-front">
                <p className="center-horz center-vert center-text">
                    { this.state.alertState === "success" ?
                        <>
                            {succ}
                            <a className="makeLookLikeLink" onClick={() => this.stopDelete(dashboardAlerts.showDeleteCatAlert, this.state.currentCatDelete)}>
                                Rückgängig
                                <img
                                    src={Undo}
                                    alt=""
                                    width="20"
                                    height="20"
                                    className="d-inline-block"
                                />
                            </a>
                        </>
                        :
                        err
                    }
                </p>
            </Alert>
        );
    }

    printDeletePass() {
        const show = this.state.showDeletePassAlert;
        let succ = "Password gelöscht ";
        let err = "Beim Löschen des Passworts ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut!";
        return (
            <Alert show={show} variant={this.state.alertState} className="center-horz center-vert error fixed-top-easypass in-front">
                <p className="center-horz center-vert center-text">
                    { this.state.alertState === "success" ?
                        <>
                            {succ}
                            <a className="makeLookLikeLink" onClick={() => this.stopDelete(dashboardAlerts.showDeletePassAlert, this.state.currentPassDelete)}>
                                Rückgängig
                                <img
                                    src={Undo}
                                    alt=""
                                    width="20"
                                    height="20"
                                    className="d-inline-block"
                                />
                            </a>
                        </>
                        :
                        err
                    }
                </p>
            </Alert>
        );
    }

    printAddPass() {
        const show = this.state.showAddedPass;
        let succ = "Passwort hinzugefügt";
        let err = "Beim Hinzufügen des Passworts ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut!";
        return (
            <Alert show={show} variant={this.state.alertState} className="center-horz center-vert error fixed-top-easypass in-front">
                <p className="center-horz center-vert center-text">
                    {this.state.alertState === "success" ?
                        succ
                        :
                        err
                    }
                </p>
            </Alert>
        );
    }

    printUser() {
        const show = this.state.showCopyUsernameAlert;
        return (
            <Alert show={show} variant="success" className="center-horz center-vert error fixed-top-easypass in-front">
                <p className="center-horz center-vert center-text">
                    Username wurde in die Zwischenablage kopiert!
                </p>
            </Alert>
        );
    }

    dismissCopy( which ) {
        sleep(2125).then(() => {
                switch (which) {
                    case dashboardAlerts.showCopyAlert:
                        this.setState({showCopyAlert: false});
                        break;
                    case dashboardAlerts.showCopyUsernameAlert:
                        this.setState({showCopyUsernameAlert: false});
                        break;
                    case dashboardAlerts.showCopyURLAlert:
                        this.setState({showCopyURLAlert: false});
                        break;
                    case dashboardAlerts.showAddedPass:
                        this.setState({showAddedPass: false});
                        break;
                    case dashboardAlerts.showEditedPass:
                        this.setState({showEditedPass: false});
                        break;
                    case dashboardAlerts.showAddedCat:
                        this.setState({showAddedCat: false});
                        break;
                    case dashboardAlerts.showEditedCat:
                        this.setState({showEditedCat: false});
                        break;
                }
            }
        );

    }

    clipboardCopy( text ) {
        // Create new element
        let el = document.createElement('textarea');
        el.value = text;
        el.setAttribute('readonly', text);
        el.style = {display: 'none',};
        document.body.appendChild(el);
        el.select();
        el.setSelectionRange(0, 99999);
        // Copy text to clipboard
        document.execCommand('copy');
        // Remove temporary element
        document.body.removeChild(el);
    }

    showDeletePopUp( which, succ ) {
        switch (which) {
            case dashboardAlerts.showDeletePassAlert:
                this.setState({
                    showDeletePassAlert: true,
                });
                sleep(4000).then(() => {
                        this.setState({
                            showDeletePassAlert: false,
                        })
                    }
                );
                break;
            case dashboardAlerts.showDeleteCatAlert:
                this.setState({
                    showDeleteCatAlert: true,
                });
                sleep(4000).then(() => {
                        this.setState({
                            showDeleteCatAlert: false,
                        })
                    }
                );
                break;
        }
        if ( succ ) {
            this.setState({
                alertState: "success",
            });
        }
        else {
            this.setState({
                alertState: "danger",
            });
        }

    }

    copy( toCopy, which, succ ) {
        switch (which) {
            case dashboardAlerts.showCopyUsernameAlert:
                this.setState({
                    showCopyUsernameAlert: true,
                });
                this.dismissCopy(dashboardAlerts.showCopyUsernameAlert);
                break;
            case dashboardAlerts.showCopyURLAlert:
                console.log("Url aus true");
                this.setState({
                    showCopyURLAlert: true,
                });
                this.dismissCopy(dashboardAlerts.showCopyURLAlert);
                break;
            case dashboardAlerts.showAddedPass:
                this.setState({
                    showAddedPass: true,
                });
                this.dismissCopy(dashboardAlerts.showAddedPass);
                break;
            case dashboardAlerts.showAddedCat:
                this.setState({
                    showAddedCat: true,
                });
                this.dismissCopy(dashboardAlerts.showAddedCat);

                break;
            case dashboardAlerts.showEditedPass:
                this.setState({
                    showEditedPass: true,
                });
                this.dismissCopy(dashboardAlerts.showEditedPass);
                break;
            case dashboardAlerts.showEditedCat:
                this.setState({
                    showEditedCat: true,
                });
                this.dismissCopy(dashboardAlerts.showEditedCat);
                break;
        }

        if ( succ ) {
            this.setState({
                alertState: "success",
            });
        }
        else {
            this.setState({
                alertState: "danger",
            });
        }

        if ( toCopy !== "" ) {
            this.clipboardCopy(toCopy);
        }
    }

    copyPass(id) {
        let pass = this.getPassword(id);
        // Popup starten
        this.setState({
            showCopyAlert: true,
        });
        this.dismissCopy("showCopyAlert");


        this.clipboardCopy(pass);
    }

    goToPage(url, id) {
        function correctUrl(url) {
            let out = url;
            if (!( url.includes("https://") || url.includes("https://") )) {
                out = "https://" + url;
            }
            return out;
        }
        this.copyPass(id);
        window.open(correctUrl(url), "_blank");
    }


    handleSearch = (e) => {
        console.log("Key Down:" + e.target.value);
        this.setState({
            [e.target.id]: e.target.value
        });
        let input, filter, passwords, div, inp, txtValue;
        input = e.target.value;

        filter = input.toUpperCase();
        passwords = document.getElementById("passwords");
        console.log("Passwords", passwords);
        div = passwords.children;
        for (let j = 0; j < div.length; j++) {
            if (div[j].tagName === "DIV") {
                console.log(div[j]);
                let editDiv = div[j].children;
                for (let i = 0; i < editDiv.length; i++) {
                    if ( editDiv[i].tagName === "DIV" ) {

                        inp = editDiv[i].children[0];
                        txtValue = inp.value;
                        if (input.length === 0) {
                            editDiv[i].style.display = "";
                        } else {
                            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                                editDiv[i].style.display = "";
                            } else {
                                editDiv[i].style.display = "none";
                            }
                        }
                    }
                }
            }
        }

    };

    logoutDash() {
        this.props.logout(this.state);
        this.props.history.push("/");
    }

    saveSettings() {
        this.props.changeLanguage(this.state.language);
    }

    cancelSettings() {
        this.setState({
            language: dashboardState.getSelectedLanguage(),
        });
    }



    setExpanded() {
        this.setState({
            expanded: !this.state.expanded
        })
    }

    setSettingExpandedFalse() {
        this.setState({
            settingsExpanded: false,
        });
    }
    setSettingExpanded() {
        this.setState({
            settingsExpanded: !this.state.settingsExpanded,
        });
    }

    resetSettingsExpanded() {
        if ( this.state.settingsExpanded ) {
            this.setState({
                settingsExpanded: false,
            });
        }
    }

    changeTab( changeTo ) {
        console.log("Changed to Tab:");
        console.log(changeTo);
        this.props.saveTab(changeTo);
        this.setState({
                tabselected: changeTo,
            }
        );
        if ( changeTo === tabs.PRIVPASS )
        {
            console.log("Priv");
            this.setState({
                catselected: dashboardState.getCatPriv()
            });
        }
        else {
            console.log("Group");
            this.setState({
                catselected: dashboardState.getCatGroup()
            });
        }

    }

    changeCat( changeTo ) {
        console.log("Change to: " + changeTo);
        this.props.saveCat(this.state.tabselected, changeTo);
        this.setState({
            catselected: changeTo
        });

    }

    /**
     * @returns [] a list with all the categories created by the user
     */
    getCats() {
        //TODO mocking Object
        return MockPasswords.getCats(this.state.tabselected);
    }

    getSelectedCatName() {
        let selected = this.state.catselected;
        if ( selected === 0 )
        {
            // TODO change language
            return "Alle Kategorien"
        }
        let cats = this.getCats();
        for ( let i = 0; i < cats.length; i++ )
        {
            if ( cats[i].id === selected ) {
                return cats[i].name;
            }
        }
    }

    addPass(user, pass, url, title, catID, tag) {
        // ToDO call Kacpers method
        this.copy("", dashboardAlerts.showAddedPass, false);
        this.dismissAddPass();
    }

    deletePass(id) {
        // ToDO call Kacpers method
        this.setState({
            currentPassDelete: id,
        });
        this.showDeletePopUp(dashboardAlerts.showDeletePassAlert, false);
    }

    stopDelete( which, id ) {
        switch (which) {
            case dashboardAlerts.showDeleteCatAlert:
                // ToDo call Kacpers  with id
                this.setState({
                    showDeleteCatAlert: false,
                });
                break;
            case dashboardAlerts.showDeletePassAlert:
                // ToDo call Kacpers method with id
                this.setState({
                    showDeletePassAlert: false,
                });
                break;
        }
    }

    saveEdit(id, userNew, passwordNew, urlNew, titleNew, catNew, tagNew) {
        // ToDo call Kacpers method
        this.copy("", dashboardAlerts.showEditedPass, true);
    }

    addCat( name, description) {
        // ToDO call Kacpers method
        this.copy("", dashboardAlerts.showAddedCat, true);
        this.dismissAddCat();
    }

    editCat( id, nameNew, descriptionNew) {
        // ToDo call Kacpers method
        this.copy("", dashboardAlerts.showEditedCat, false);
        this.dismissEditCat();
    }

    deleteCat(id) {
        // ToDo call Kacpers method
        this.setState({
            currentCatDelete: id,
        });
        this.showDeletePopUp(dashboardAlerts.showDeleteCatAlert, true);
        this.dismissDeleteCat()
    }

    setSidebarState( to ) {
        this.setState({
            sidebarClosed: to,
        });
        this.props.saveSidebarClosed(to);
    }

    showAddPass() {
        this.setState({
            popUpAddPassShow: true,
        })
    }

    dismissAddPass() {
        this.setState({
            popUpAddPassShow: false,
        })
    }
    getPassAddShow() {
        return this.state.popUpAddPassShow;
    }

    dismissAddCat() {
        this.setState({
            popUpAddCatShow: false,
        })
    }

    showAddCat() {
        this.setState({
            popUpAddCatShow: true,
        })
    }

    getCatAddShow() {
        return this.state.popUpAddCatShow;
    }

    dismissEditCat() {
        this.setState({
            popUpEditCatShow: false,
        });
    }

    showEditCat() {
        this.setState({
            popUpEditCatShow: true,
        });
    }

    getCatEditShow() {
        return this.state.popUpEditCatShow;
    }

    dismissDeleteCat() {
        this.setState({
            popUpDeleteCatShow: false,
        });
    }

    showDeleteCat() {
        this.setState({
            popUpDeleteCatShow: true,
        });
    }

    getCatDeleteShow() {
        return this.state.popUpDeleteCatShow;
    }

    getTab() {
        let out;
        switch (this.state.tabselected) {
            case tabs.PRIVPASS:
                out = (<PrivatePassword callback={this}/>);
                break;
            case tabs.GROUPPASS:
                out = (<GroupPassword callback={this}/>);
                break;
        }

        return out;
    }

    render() {
        // <NavbarVerticalEP callback={this} />
        // <div className="size-hole-window">
        // ml-sm-auto col-lg-10 px-4


        let mainClasses = "fixMain animateWidth";
        let sidebarClass = "";
        if ( this.state.expanded )
        {
            // >= 992px the navbar is never expandable
            if ( this.state.width < 992 ) {
                mainClasses += " expanded";
                sidebarClass += " expandedSidebar";
                if ( this.state.settingsExpanded) {
                    mainClasses += " expandedSettings";
                    sidebarClass += " expandedSidebarSettings";
                }
            }
        }

        let indicatorClass = "animateTransform";
        if ( this.state.sidebarClosed )
        {
            indicatorClass += " sidebarClosed";
        }

        return (
            <div className="size-hole-window-hidden-scroll" onClick={this.resetSettingsExpanded}>
                <NavbarEP callback={this} width={this.state.width} language={this.state.language}/>
                <div className="container-fluid fixScroll">
                    <Row>
                        <NavbarVerticalEP2 callback={this} className={sidebarClass} />
                        { this.state.sidebarClosed ?
                            <Col className={mainClasses + " fitHole"}>
                                {this.getTab()}
                            </Col>
                            :
                            <Col md={9} sm={7} xs={7} lg={9} className={mainClasses}>
                                {this.getTab()}
                            </Col>
                        }

                        <hr/>
                        <IndicatorSide className={indicatorClass} />
                    </Row>
                    <Button className="fab" variant="danger" onClick={this.showAddPass}>
                        <img
                            src={AddPass}
                            alt=""
                            width="20"
                            height="20"
                            className="d-inline-block addIcon"
                        />
                        <div className="text">
                            <span>Passwort hinzufügen</span>
                        </div>
                    </Button>
                    <AddPassword callback={this}/>
                </div>
                <AddCategory callback={this}/>
                <EditCategory callback={this}/>
                <DeleteCategory callback={this}/>
                {this.printCopy()}
                {this.printUser()}
                {this.printURL()}
                {this.printAddPass()}
                {this.printEditPass()}
                {this.printDeletePass()}
                {this.printEditCat()}
                {this.printAddCat()}
                {this.printDeleteCat()}
            </div>
        );
    }
}

const mapDispatchToProps3 = (dispatch) => {
    return {
        login: (creds) => dispatch(login(creds)),
        logout: () => dispatch(logout()),
        saveTab: (tabselected) => dispatch(saveTab(tabselected)),
        saveCat: (tabselected, catselected) => dispatch(saveCat(tabselected, catselected)),
        saveSidebarClosed: (sidebarClosed) => dispatch(saveSidebarClosed(sidebarClosed)),
        changeLanguage: (language) => dispatch(changeLanguage(language)),
    };
};

const mapStateToProps3 = (state) => {
    return{
        loggedIn: state.auth.loggedIn
    }
};


function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

export default connect(mapStateToProps3, mapDispatchToProps3, null, { pure: false})(Dashboard)