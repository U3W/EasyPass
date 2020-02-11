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
import AddGroup from "../../img/icons/group_add.svg";
import Undo from "../../img/icons/password_delete_undo_blue.svg"

import AddCategory from "./add.cat";
import EditCategory from "./edit.cat";
import DeleteCategory from "./delete.cat";
import history from "../../routing/history"
import StringSelector from "../../strings/stings";
//import Entries from "./Entries";
import * as that from "./dashboard.extended";
import * as dashboardEntries from "./dashboard.entries";

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
            //console.log("Priv");
            cat = dashboardState.getCatPriv();
        }
        else {
            //console.log("Group");
            cat = dashboardState.getCatGroup();
        }

        this.state = {
            // mockpassword
            mock: new MockPasswords(this.props.worker),
            // password entries,

            //entries: new Entries(),
            entries: {
                passwords: [],
                categories: []
            },
            passwordCache: undefined,
            passwordCacheID: undefined,
            show: false,

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

            // resetPass vars
            errorShow: false,
            errorText: "",
            errorState: "success",

            // To Copy the password in firefox
            copyText: "",
        };

        this.setErrorShow = this.setErrorShow.bind(this);
        this.setErrorState = this.setErrorState.bind(this);
        this.setErrorText = this.setErrorText.bind(this);

        this.handleSearch = this.handleSearch.bind(this);
        this.setExpanded = this.setExpanded.bind(this);
        this.logoutDash = this.logoutDash.bind(this);
        this.getTab = this.getTab.bind(this);
        this.getCats = this.getCats.bind(this);
        this.changeCat = this.changeCat.bind(this);
        this.changeTab = this.changeTab.bind(this);
        this.dismissCopy = this.dismissCopy.bind(this);
        this.saveEdit = that.saveEdit.bind(this);
        this.renderCat = this.renderCat.bind(this);
        this.resetSettingsExpanded = this.resetSettingsExpanded.bind(this);
        // Popups
        this.dismissAddCat = this.dismissAddCat.bind(this);
        this.showAddCat = this.showAddCat.bind(this);
        this.getCatAddShow = this.getCatAddShow.bind(this);
        this.showAddPass = this.showAddPass.bind(this);
        this.dismissAddPass = this.dismissAddPass.bind(this);
        this.getPassAddShow = this.getPassAddShow.bind(this);
        // update, delete and so on
        this.getCats = this.getCats.bind(this);
        this.renderLinesSonstige = this.renderLinesSonstige.bind(this);
        this.renderLines = this.renderLines.bind(this);
        this.addPass = that.addPass.bind(this);
        this.deletePass = that.deletePass.bind(this);
        this.getPass = that.getPass.bind(this);
        this.getPassForUpdate = that.getPassForUpdate.bind(this);
        this.copyPass = that.copyPass.bind(this);
        this.goToPage = that.goToPage.bind(this);
        this.resetPass = that.resetPass.bind(this);
        this.undoDelete = that.undoDelete.bind(this);

        this.addCat = that.addCat.bind(this);
        this.updateCat = that.updateCat.bind(this);
        this.deleteCats = that.deleteCats.bind(this);
        // WindowDimensions
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        // Worker
        this.workerCall = that.workerCall.bind(this);
        // Entry functions
        this.loadEntries = dashboardEntries.loadEntries.bind(this);
        this.getCatsFromTab = dashboardEntries.getCatsFromTab.bind(this);
        this.getCatData = dashboardEntries.getCatData.bind(this);

    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        this.props.worker.addEventListener("message", this.workerCall);
        this.props.worker.postMessage(['dashboard', undefined]);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
        this.props.worker.postMessage(['unregister', undefined]);
        this.props.worker.removeEventListener("message", this.workerCall);
    }

    updateWindowDimensions() {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    }

    changeLanguageTo( to ) {
        this.setState({
            language: to
        });
    }

    renderLines(cats) {
        let passwords = {};

        if (cats[0] !== undefined) {
            console.log(cats);
            for (let i = 0; i < cats.length; i++) {
                let catId = cats[i]._id;
                let catData = this.getCatData(catId, this.state.tabselected);
                // add callback to array
                if (catData !== undefined) {
                    catData = this.addCallback(catData);
                    passwords[catId] = catData.map(singlePass => {
                        return (
                            <PassLine key={singlePass._id+singlePass._rev} tag={singlePass.tags} id={singlePass._id}
                                      cat={singlePass.catID} rev={singlePass._rev} user={singlePass.user}
                                      pass={singlePass.passwd} title={singlePass.title}
                                      url={singlePass.url} callback={singlePass.callback}
                                      passwordCache={this.state.passwordCache}
                                      passwordCacheID={this.state.passwordCacheID}
                                      show={this.state.show}/>
                        );
                    });
                } else return undefined;
            }
            return passwords;

        } else return undefined;
    }

    renderLinesSonstige() {
        let passwords = {};
        let selectedTab = this.state.tabselected;
        let catData = this.getCatData("0", this.state.tabselected);

        // add callback to array
        if (catData !== undefined && catData.length > 0) {
            catData = this.addCallback(catData);
            passwords[0] = catData.map(singlePass => {
                //if (singlePass.tabID === selectedTab) {
                    return (
                        <PassLine key={singlePass._id+singlePass._rev} tag={singlePass.tags} id={singlePass._id}
                                  cat={singlePass.catID} rev={singlePass._rev} user={singlePass.user}
                                  pass={singlePass.passwd} title={singlePass.title}
                                  url={singlePass.url} callback={singlePass.callback}
                                  passwordCache={this.state.passwordCache}
                                  passwordCacheID={this.state.passwordCacheID}
                                  show={this.state.show}/>
                    );
                //}
            });
            return passwords;

        } else return undefined;
    }

    renderCat() {
        let cats = this.getCats();

        let passwordsWithCats = this.renderLines(cats);
        let passwordsWithout = this.renderLinesSonstige();

        let renderWithCats = "";
        let renderWithout = "";

        let catselected = this.state.catselected;
        let language = this.state.language;

        let nothingAdded = "";
        let i = -1;
        if (passwordsWithCats !== undefined) {
            renderWithCats = cats.map(function (cat) {
                if ( cat._id === catselected || catselected === "0") {
                    i++;
                    return (
                        <div key={i}>
                            <strong>{cat.name}</strong>
                            {cat.desc.length === 0 ?
                                ""
                                :
                                <br/>
                            }
                            {cat.desc}
                            <hr/>
                            { passwordsWithCats[cat._id].length === 0 ?
                                <>
                                    <p>{StringSelector.getString(language).noPassToCat}</p>
                                </>
                                :
                                passwordsWithCats[cat._id]
                            }
                        </div>
                    )
                }
                else {
                    return (
                        ""
                    )
                }

            });
        }
        else if (passwordsWithout === undefined) {
            nothingAdded = StringSelector.getString(this.state.language).noCatsNoPass;
            // ToDo vielleicht noch eine schönere Lösung finden
            if ( this.state.catselected !== "0" ) {
                this.setState({
                    catselected: "0",
                });
            }
        }


        if (passwordsWithout !== undefined) {
            renderWithout = (
                <div>
                    <strong>{StringSelector.getString(this.state.language).mainNotAddedToCat}</strong>
                    <br/>
                    {StringSelector.getString(this.state.language).mainNotAddedToCatInfo}
                    <hr/>
                    {passwordsWithout[0]}
                </div>
            );
        }


        return (
            <>
                { this.state.catselected === "0" &&
                    <>
                        <h5>{StringSelector.getString(this.state.language).mainAllCat}</h5>
                        <hr/>
                    </>
                }
                {renderWithCats}
                { this.state.catselected === "0" &&
                    renderWithout
                }
                {nothingAdded}
            </>
        );
    }

    addCallback( catData ) {

        if (catData !== null && catData !== undefined) {
            for (let i = 0; i < catData.length; i++ ) {
                catData[i]["callback"] = this;
            }
        }

        return catData;
    }

    setErrorShow( to ) {
        this.setState({
            errorShow: to,
        });
        sleep(4000).then(() => {
                this.setState({
                    errorShow: false,
                })
            }
        );
    }

    setErrorState( to ) {
        this.setState({
            errorState: to,
        });
    }

    setErrorText( to ) {
        this.setState({
            errorText: to,
        });
    }

    printResetPassPopUp() {
        console.log("Show State", this.state.errorShow);
        return (
            <Alert show={this.state.errorShow} variant={this.state.errorState} className="center-horz center-vert error fixed-top-easypass in-front">
                <p className="center-horz center-vert center-text">
                    {this.state.errorText}
                </p>
            </Alert>
        );
    }


    printCopy() {
        const show = this.state.showCopyAlert;
        let succ = StringSelector.getString(this.state.language).linePassCopiedSuc;
        let err = StringSelector.getString(this.state.language).linePassCopiedErr;
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
                    {StringSelector.getString(this.state.language).lineURLCopied}
                </p>
            </Alert>
        );
    }

    printAddCat() {
        const show = this.state.showAddedCat;
        let succ = StringSelector.getString(this.state.language).addCatSucc;
        let err = StringSelector.getString(this.state.language).addCatErr;
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
        let succ = StringSelector.getString(this.state.language).editCatSucc;
        let err = StringSelector.getString(this.state.language).editCatErr;
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
        let succ = StringSelector.getString(this.state.language).linePassEditSuc;
        let err = StringSelector.getString(this.state.language).linePassEditErr;
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
            succ = StringSelector.getString(this.state.language).delCatSuccMult;
            err = StringSelector.getString(this.state.language).delCatErrMult;
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
                            <a className="makeLookLikeLink" onClick={() => this.undoDelete(dashboardAlerts.showDeleteCatAlert, this.state.currentCatDelete)}>
                                {StringSelector.getString(this.state.language).delCatSucc2}
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
        let succ = StringSelector.getString(this.state.language).linePassDelSuc;
        let err = StringSelector.getString(this.state.language).linePassDelErr;
        return (
            <Alert show={show} variant={this.state.alertState} className="center-horz center-vert error fixed-top-easypass in-front">
                <p className="center-horz center-vert center-text">
                    { this.state.alertState === "success" ?
                        <>
                            {succ}
                            <a className="makeLookLikeLink" onClick={() => this.undoDelete(dashboardAlerts.showDeletePassAlert, this.state.currentPassDelete)}>
                                {StringSelector.getString(this.state.language).linePassDelSuc2}
                                <img
                                    src={Undo}
                                    alt=""
                                    width="18"
                                    height="18"
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
        let succ = StringSelector.getString(this.state.language).linePassAddSuc;
        let err = StringSelector.getString(this.state.language).linePassAddErr;
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
                    {StringSelector.getString(this.state.language).lineUserCopied}
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
        // another method for firefox
        if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) { // geht nicht ToDo @Kacper do this!!!!
            navigator.clipboard.writeText(text).then(function() {
            }, function() {
            });
        }
        else {
            // Create new element
            let el = document.createElement('textarea');
            el.value = text;
            el.setAttribute('readonly', text);
            el.style = {display: 'none',};
            document.body.appendChild(el);
            el.select();
            //el.setSelectionRange(0, 99999);
            // Copy text to clipboard
            document.execCommand('copy');
            // Remove temporary element
            document.body.removeChild(el);
        }

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
                //console.log("Url aus true");
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

    handleSearch = (e) => {
        //console.log("Key Down:" + e.target.value);
        this.setState({
            [e.target.id]: e.target.value
        });
        let input, filter, passwords, div, inp, txtValue;
        input = e.target.value;

        filter = input.toUpperCase();
        passwords = document.getElementById("passwords");
        //console.log("Passwords", passwords);
        div = passwords.children;
        for (let j = 0; j < div.length; j++) {
            if (div[j].tagName === "DIV") {
                //console.log(div[j]);
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
        history.push("/");
    }

    saveSettings() {
        this.props.changeLanguage(this.state.language);
        location.reload();
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
        //console.log("Changed to Tab:");
        //console.log(changeTo);
        this.props.saveTab(changeTo);
        this.setState({
                tabselected: changeTo,
            }
        );
        if ( changeTo === tabs.PRIVPASS )
        {
            //console.log("Priv");
            this.setState({
                catselected: dashboardState.getCatPriv()
            });
        }
        else {
            //console.log("Group");
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
        return this.sortCatsAlph(this.getCatsFromTab(this.state.tabselected));
    }

    sortCatsAlph( cats ) {
        cats.sort(function(a, b){
            if(a.name < b.name) { return -1; }
            if(a.name > b.name) { return 1; }
            return 0;
        });
        return cats
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

    generateKeyfile() {
        // ToDO call Moritz Method
        console.log("Hier keyfile")
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

    addUserToGroupAcc( user ) {
        // ToDo call kacpers Method
        return true;
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

        let langText = "text";
        if ( this.state.language === dashboardLanguage.english ) {
            langText = "textEng";
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
                    { this.state.tabselected === tabs.GROUPPASS ?
                        <Button className="groupfab" variant="danger" onClick={this.showAddPass}>
                            <img
                                src={AddGroup}
                                alt=""
                                width="20"
                                height="20"
                                className="d-inline-block addIcon"
                            />
                            <div className={langText}>
                                <span>{StringSelector.getString(this.state.language).addGroup}</span>
                            </div>
                        </Button>
                        :
                        <Button className="groupOut groupfab" variant="danger" onClick={this.showAddPass}>
                            <img
                                src={AddGroup}
                                alt=""
                                width="20"
                                height="20"
                                className="d-inline-block addIcon"
                            />
                            <div className={langText}>
                                <span>{StringSelector.getString(this.state.language).addGroup}</span>
                            </div>
                        </Button>
                    }
                    <Button className="fab" variant="danger" onClick={this.showAddPass}>
                        <img
                            src={AddPass}
                            alt=""
                            width="20"
                            height="20"
                            className="d-inline-block addIcon"
                        />
                        <div className={langText}>
                            <span>{StringSelector.getString(this.state.language).addPass}</span>
                        </div>
                    </Button>
                    <AddPassword callback={this}/>
                </div>
                <AddCategory callback={this}/>
                <EditCategory callback={this}/>
                <DeleteCategory callback={this}/>
                {this.printResetPassPopUp()}
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