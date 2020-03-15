import React from "react";
import {Button, Col, Row} from "react-bootstrap";
import NavbarEP from "../navbar/navbar";
import "../navbar/navbar.css";
import "./dashboard.css";
import {connect} from "react-redux";
import {login, logout} from "../../action/auth.action";
import NavbarVerticalEP2 from "../navbar/navbar.vertical.v2";
import LoginAuth from "../../authentification/auth.login"
import IndicatorSide from "../../network/network.indicator.sidebar";
import tabs from "./tabs/tab.enum";
import PrivatePassword from "./tabs/private.password";
import GroupPassword from "./tabs/group.password";
import MockPasswords from "./MockPasswords";
import PassLine from "./line.temp";
import {
    changeLanguage,
    saveCat, saveGroup, saveSidebarClosed,
    saveTab
} from "../../action/dashboard.action";
import dashboardState from "./dashboard.saved.state"
import Alert from "react-bootstrap/Alert";
import {dashboardAlerts, dashboardLanguage} from "./const/dashboard.enum";
import AddPassword from "../dashboard/add.password"
import copy from 'copy-to-clipboard';
// Icons
import AddPass from "../../img/icons/password_add_pass.svg";
import AddGroupIcon from "../../img/icons/group_add.svg";
import Undo from "../../img/icons/password_delete_undo_blue.svg"

import AddCategory from "./add.cat";
import EditCategory from "./edit.cat";
import DeleteCategory from "./delete.cat";
import history from "../../routing/history"
import StringSelector from "../../strings/stings";
//import Entries from "./Entries";
import * as that from "./dashboard.extended";
import * as dashboardEntries from "./dashboard.entries";
import AddGroup from "./add.group";
import GroupCard from "./card.temp";
import GroupReturn from "../../img/icons/group_return.svg";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import DeleteIcon from "../../img/icons/password_delete_white.svg";
import EditIcon from "../../img/icons/password_edit_white.svg";
import Table from "react-bootstrap/Table";
import EditGroup from "./edit.group";
import SingleGroup from "./single.group";

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
            entries: new Map(),

            passwordCache: undefined,
            passwordCacheID: undefined,
            show: false,

            // language
            language: dashboardState.getSelectedLanguage(), // 0 - Deutsch, 1 - English

            search: "",
            username: LoginAuth.getUsername(),
            tabselected: tab, // tabs.PRIVPASS
            catselected: cat, //JSON.parse(localStorage.getItem(dashboardConst.catselectedPriv)),
            groupselected: dashboardState.getSelectedGroup(),

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
            // wrong creds popup
            popUpWrongCreds: false,
            // cat add
            popUpAddCatShow: false,
            // cat edit
            popUpEditCatShow: false,
            // cat delete
            showDeleteCatAlert: false,
            // password add
            popUpAddPassShow: false,
            // group add
            popUpAddGroupShow: false, // false,
            // group alerts
            showAddedGroup: false,
            showDeleteGroup: false,
            showEditedGroup: false,
            // Edit Group PopUp
            showEditGroupPopUp: false,

            // password delete alert
            showDeletePassAlert: false,

            // for the undo delete
            currentCatDelete: [],
            currentPassDelete: -1,
            currentGroupDelete: -1,
            // for edit group
            editCallback: null,
            currGroupEditId: -1,
            currGroupEditName: "",
            currGroupEditUserGroupList: [],

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
        this.handleSearchGroup = this.handleSearchGroup.bind(this);
        this.setExpanded = this.setExpanded.bind(this);
        this.logoutDash = this.logoutDash.bind(this);
        this.getTab = this.getTab.bind(this);
        this.getCats = this.getCats.bind(this);
        this.changeCat = this.changeCat.bind(this);
        this.changeTab = this.changeTab.bind(this);
        this.dismissCopy = this.dismissCopy.bind(this);
        this.saveEdit = that.saveEdit.bind(this);
        this.renderCat = this.renderCat.bind(this);
        this.renderGroup = this.renderGroup.bind(this);
        this.deleteGroup = this.deleteGroup.bind(this);
        this.resetSettingsExpanded = this.resetSettingsExpanded.bind(this);
        // Popups
        this.dismissAddCat = this.dismissAddCat.bind(this);
        this.showAddCat = this.showAddCat.bind(this);
        this.getCatAddShow = this.getCatAddShow.bind(this);
        this.showAddPass = this.showAddPass.bind(this);
        this.dismissAddPass = this.dismissAddPass.bind(this);
        this.getPassAddShow = this.getPassAddShow.bind(this);
        this.showAddGroup = this.showAddGroup.bind(this);
        this.dismissAddGroup = this.dismissAddGroup.bind(this);
        this.getGroupAddShow = this.getGroupAddShow.bind(this);
        // update, delete and so on
        this.getCats = this.getCats.bind(this);
        this.renderLinesSonstige = this.renderLinesSonstige.bind(this);
        this.renderLines = this.renderLines.bind(this);
        this.addGroup = that.addGroup.bind(this);
        this.editGroup = that.editGroup.bind(this);
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


        this.triggerEditGroup = this.triggerEditGroup.bind(this);
        this.setWrongCreds = this.setWrongCreds.bind(this);

        // WindowDimensions
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        // Worker
        this.workerCall = that.workerCall.bind(this);
        // Entry functions
        this.loadEntries = dashboardEntries.loadEntries.bind(this);
        this.setEntry = dashboardEntries.setEntry.bind(this);
        this.removeEntry = dashboardEntries.removeEntry.bind(this);
        this.getCatsFromTab = dashboardEntries.getCatsFromTab.bind(this);
        this.getCatsFromGroup = dashboardEntries.getCatsFromGroup.bind(this);
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
            for (let i = 0; i < cats.length; i++) {
                let catId = cats[i]._id;
                let catData = this.getCatData(catId, this.state.tabselected, this.state.groupselected);
                // add callback to array
                if (catData !== undefined) {
                    catData = this.addCallback(catData);
                    passwords[catId] = catData.map(singlePass => {
                        return (
                            <PassLine key={singlePass._id+singlePass._rev} tag={singlePass.tags} id={singlePass._id} groupId={singlePass.groupId}
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
        let catData = this.getCatData("0", this.state.tabselected, this.state.groupselected);

        // add callback to array
        if (catData !== undefined && catData.length > 0) {
            catData = this.addCallback(catData);
            passwords[0] = catData.map(singlePass => {
                //if (singlePass.tabID === selectedTab) {
                    return (
                        <PassLine key={singlePass._id+singlePass._rev} tag={singlePass.tags} id={singlePass._id} groupId={singlePass.groupId}
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


    deleteGroup( id, ref) {
        // change to group menu
        this.changeGroup("0");
        // ToDo call Kacpers method
        this.setState({
            showDeleteGroup: true,
            alertState: "success",
            currentGroupDelete: id,
        });
        this.dismissCopy(dashboardAlerts.showDeleteGroup);
    }

    getEditGroup() {
        return this.state.showEditGroupPopUp;
    }

    disableEditGroup() {
        this.setState({
            showEditGroupPopUp: false,
        });
    }

    triggerEditGroup( id, ref, name, userGroupList) {
        this.state.editCallback(id, ref,name,userGroupList);
        this.setState({
            showEditGroupPopUp: true,
        });
    }

    /**
     * Callback to set editData
     * @param callback
     */
    setEditCallback( callback ) {
        this.setState({
            editCallback: callback,
        });
    }

    getSelectedGroupName() {
        // ToDo Kacpers method
        return "Temp Name";
    }

    renderGroup() {
        let rend;
        // ToDo kacpers method
        const groups = [
            {name: "Test1", userGroupList:["Aha", "huhu", "haha", "hihi", "huuuuuh", "haskdad"], id:"1", ref:"1"},
            {name: "Test2", userGroupList:["Aha", "huhu", "lasdald", "akhakjsd"], id:"2", ref:"2"},
            {name: "Test3", userGroupList:["Aha", "huhu", "asdads"], id:"3", ref:"3"},
            {name: "Test4", userGroupList:["Aha", "huhu", "asdsada"], id:"4", ref:"4"},
            {name: "Test5", userGroupList:["Aha", "huhu"], id:"5", ref:"5"},
            {name: "Test6", userGroupList:["Aha", "huhu"], id:"6", ref:"6"},
            {name: "Test7", userGroupList:[], id:"7", ref:"7"},
        ];
        if ( this.state.groupselected === "0") {
            // Group menu
            let groupsRend;
            if ( groups.length === 0 ) {
                groupsRend = (
                    <p>{StringSelector.getString(this.state.language).noCatsNoPass}</p>
                );
            }
            else {
                let i = -1;
                groupsRend = groups.map(singleGroup => {
                    i++;
                    return (
                        <Col key={i} xs={12} sm={6} md={4}>
                            <GroupCard callback={this} name={singleGroup.name} userGroupList={singleGroup.userGroupList} _id={singleGroup.id} _ref={singleGroup.ref}/>
                        </Col>
                    );
                });
            }

            rend = (
                <>
                    <h5>{StringSelector.getString(this.state.language).cardMenu}</h5>
                    <hr/>
                    <Row>
                        {groupsRend}
                    </Row>
                </>
            );
        }
        else {
            // Single Group
            let singleInd = -1;
            for ( let i = 0; i < groups.length; i++ ) {
                if ( groups[i].id === this.state.groupselected ) {
                    singleInd = i;
                    break;
                }
            }
            rend = (
                <>
                    <SingleGroup callback={this} name={groups[singleInd].name} userGroupList={groups[singleInd].userGroupList} id={groups[singleInd]._id} ref={groups[singleInd]._ref}/>
                </>
            );
        }
        return rend;
    }

    getVisibilityTable( userGroupList, callback ) {
        let key = -1;
        let elms;
        if ( userGroupList.length === 0 ) {
            elms = StringSelector.getString(this.state.language).addGroupUserVisNon;
            return (
                <>
                    <div className="visMargin">
                        <h6 className="noMarginBottom">{StringSelector.getString(this.state.language).addGroupUserVis}</h6>
                        <i>{StringSelector.getString(this.state.language).addGroupUserVis2}</i>
                    </div>
                    - {elms}
                </>
            );
        }
        else {
            let elmsArray = [];
            for ( let i = 0; i < userGroupList.length; i++ ) {
                const item = userGroupList[i];
                let tdClass = "";
                if ( i === 0 ) {
                    tdClass += "topRound";
                }
                if ( i === userGroupList.length-1) {
                    tdClass += " botRound";
                }
                elmsArray[i] = (
                    <td className={tdClass}>
                        {item}
                        <button type="button" className="close userRemove" onClick={() => callback.removeUserFromGroup(i)}>
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
                        <h6 className="noMarginBottom">{StringSelector.getString(this.state.language).addGroupUserVis}</h6>
                        <i>{StringSelector.getString(this.state.language).addGroupUserVis2}</i>
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

    getGroupErrorMsg( popUpGroupError, groupErrTyp) {
        if ( popUpGroupError ) {
            let err = StringSelector.getString(this.state.language).addGroupUserNotFound;
            if ( groupErrTyp === 1 ) {
                err = StringSelector.getString(this.state.language).addGroupUserAlready;
            }
            return (
                <p className="text-danger fixErrorMsg">{err}</p>
            );
        }
    }

    getCatsForGroup() {
        return this.sortCatsAlph(this.getCatsFromGroup(this.state.groupselected));
    }

    renderGroupCat() {
        let cats = this.getCatsForGroup();
        let passwordsWithCats = this.renderLines(cats);
        let passwordsWithout = this.renderLinesSonstige();

        let renderWithCats = "";
        let renderWithout = "";

        let catselected = this.state.catselected;
        let groupselected = this.state.groupselected;
        let language = this.state.language;

        let nothingAdded = "";
        let i = -1;
        if (passwordsWithCats !== undefined) {
            renderWithCats = cats.map(function (cat) {
                if ( cat.groupId === groupselected && cat._id === catselected || catselected === "0") {
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
        else if (passwordsWithout === undefined && cats.length === 0) {
            // If there are no cats and pass
            nothingAdded = StringSelector.getString(this.state.language).noCatsNoPass;
            if ( this.state.catselected !== "0" ) {
                this.changeCat("0")
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
            // If there are no cats and pass
            nothingAdded = StringSelector.getString(this.state.language).noCatsNoPass;
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
            succ = StringSelector.getString(this.state.language).delCatSuccSing;
            err = StringSelector.getString(this.state.language).delCatErrSing;
        }
        return (
            <Alert show={show} variant={this.state.alertState} className="center-horz center-vert error fixed-top-easypass in-front">
                <p className="center-horz center-vert center-text">
                    { this.state.alertState === "success" ?
                        <>
                            {succ + " "}
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
                            {succ + " "}
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

    printAddGroup() {
        const show = this.state.showAddedGroup;
        let succ = StringSelector.getString(this.state.language).cardAddSuc;
        let err = StringSelector.getString(this.state.language).cardAddErr;
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

    printDeleteGroup() {
        const show = this.state.showDeleteGroup;
        let succ = StringSelector.getString(this.state.language).cardDelSuc;
        let err = StringSelector.getString(this.state.language).linePassAddErr;
        return (
            <Alert show={show} variant={this.state.alertState} className="center-horz center-vert error fixed-top-easypass in-front">
                <p className="center-horz center-vert center-text">
                    {this.state.alertState === "success" ?
                        <>
                            {succ + " "}
                            <a className="makeLookLikeLink" onClick={() => this.undoDelete(dashboardAlerts.showDeleteGroup, this.state.currentGroupDelete)}>
                                {StringSelector.getString(this.state.language).cardDelSuc2}
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

    printEditGroup() {
        const show = this.state.showEditedGroup;
        let succ = StringSelector.getString(this.state.language).cardEditSuc;
        let err = StringSelector.getString(this.state.language).cardEditErr;
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

    printWrongCreds() {
        return (
            <Alert show={this.state.popUpWrongCreds} variant="danger" className="center-horz center-vert error fixed-top-easypass in-front">
                <p className="center-horz center-vert center-text">
                    {StringSelector.getString(this.state.language).wrongLogin}
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
                    case dashboardAlerts.showAddedGroup:
                        this.setState({showAddedGroup: false});
                        break;
                    case dashboardAlerts.showEditedGroup:
                        this.setState({showEditedGroup: false});
                        break;
                    case dashboardAlerts.showDeleteGroup:
                        this.setState({showDeleteGroup: false});
                        break;
                }
            }
        );

    }


    async clipboardCopy( text ) {
        // For browser that support the new clipboard-API
        if (navigator.clipboard !== undefined) {
            try {
                await navigator.clipboard.writeText(text);
                console.log("Copied to Clipboard");
                return Promise.resolve();
            } catch (e) {
                console.log("Could not copy to Clipboard", e);
                return Promise.reject();
            }
        } else { // Legacy support
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
            return Promise.resolve();
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

    handleSearchGroup(e) {
        this.setState({
            [e.target.id]: e.target.value
        });
        let input, filter, passwords, div, inp, inp2, txtValue, txtValue2;
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
                        inp = editDiv[i].children[0].children[0];
                        txtValue = inp.value;
                        if (input.length === 0) {
                            editDiv[i].style.display = "";
                        } else {
                            if (txtValue.toUpperCase().indexOf(filter) > -1){
                                editDiv[i].style.display = "";
                            } else {
                                editDiv[i].style.display = "none";
                            }
                        }
                    }
                }
            }
        }
    }

    handleSearch(e) {
        //console.log("Key Down:" + e.target.value);
        this.setState({
            [e.target.id]: e.target.value
        });
        let input, filter, passwords, div, inp, inp2, txtValue, txtValue2;
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
                        inp2 = editDiv[i].children[1];
                        txtValue = inp.value;
                        txtValue2 = inp2.value;
                        if (input.length === 0) {
                            editDiv[i].style.display = "";
                        } else {
                            if (txtValue.toUpperCase().indexOf(filter) > -1 || txtValue2.toUpperCase().indexOf(filter) > -1) {
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
        //location.reload();
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

    changeGroup( changeTo ) {
        this.props.saveGroup(changeTo);
        this.setState({
            groupselected: changeTo,
        });
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
        if ( selected === "0" )
        {
            return StringSelector.getString(this.state.language).catsAllCat
        }
        let cats = this.getCats();
        if ( this.state.tabselected === tabs.GROUPPASS ){
            cats = this.getCatsForGroup();
        }
        for ( let i = 0; i < cats.length; i++ )
        {
            if ( cats[i]._id === selected ) {
                return cats[i].name;
            }
        }

    }

    generateKeyfile() {
        // ToDO call Kacpers Method
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

    showAddGroup() {
        this.setState({
            popUpAddGroupShow: true,
        })
    }

    dismissAddGroup() {
        this.setState({
            popUpAddGroupShow: false,
        })
    }
    getGroupAddShow() {
        return this.state.popUpAddGroupShow;
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

    setWrongCreds() {
        this.setState({
            popUpWrongCreds: true,
        });
        setTimeout(() => {
            this.setState({
                popUpWrongCreds: false,
            });
            history.push("/");
        }, 5000);
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
        let fabPassClass = "fab";
        let fabGroupClass = "groupfab";
        if ( this.state.language === dashboardLanguage.english ) {
            langText = "textEng";
            fabPassClass = "fabEng";
            fabGroupClass = "groupfabEng";
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
                        { this.state.width > 425 ?
                            <IndicatorSide className={indicatorClass} ref={this.props.callback.ref}/>
                            :
                            <IndicatorSide className={indicatorClass}/>
                        }
                    </Row>
                    { (this.state.tabselected === tabs.GROUPPASS && this.state.groupselected === "0") ?
                        <Button className={fabGroupClass} variant="danger" onClick={this.showAddGroup}>
                            <img
                                src={AddGroupIcon}
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
                        <Button className={fabGroupClass + " groupOut"} variant="danger">
                            <img
                                src={AddGroupIcon}
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
                    { (this.state.tabselected === tabs.GROUPPASS && this.state.groupselected === "0") ?
                        <Button className={fabPassClass + " passOut"} variant="danger" onClick={this.showAddPass}>
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
                        :
                        <Button className={fabPassClass} variant="danger" onClick={this.showAddPass}>
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
                    }
                </div>
                <AddPassword callback={this}/>
                <AddGroup callback={this}/>
                <AddCategory callback={this}/>
                <EditCategory callback={this}/>
                <DeleteCategory callback={this}/>
                <EditGroup callback={this}/>
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
                {this.printAddGroup()}
                {this.printDeleteGroup()}
                {this.printEditGroup()}
                {this.printWrongCreds()}
            </div>
        );
    }
}

const mapDispatchToProps3 = (dispatch) => {
    return {
        logout: () => dispatch(logout()),
        saveTab: (tabselected) => dispatch(saveTab(tabselected)),
        saveCat: (tabselected, catselected) => dispatch(saveCat(tabselected, catselected)),
        saveSidebarClosed: (sidebarClosed) => dispatch(saveSidebarClosed(sidebarClosed)),
        changeLanguage: (language) => dispatch(changeLanguage(language)),
        saveGroup: (groupselected) => dispatch(saveGroup(groupselected)),
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