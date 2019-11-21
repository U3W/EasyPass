import React from "react";
import {Col, Row} from "react-bootstrap";
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
import {authConstants as dashboardConst, authConstants} from "../../authentification/auth.const.localstorage";
import {
    saveCat,
    saveTab
} from "../../action/dashboard.action";
import dashboardState from "./dashboard.saved.state"
import Alert from "react-bootstrap/Alert";
import {wrongLogin, wrongLoginHeader} from "../../strings/stings";
import {dashboardAlerts} from "./const/dashboard.enum";
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
            search: "",
            username: "Username",
            tabselected: tab, // tabs.PRIVPASS
            catselected: cat, //JSON.parse(localStorage.getItem(dashboardConst.catselectedPriv)),
            expanded: false,
            // alerts
            showCopyAlert: false,
            showCopyUsernameAlert: false,
            showCopyURLAlert: false,
        };


        this.handleSearch = this.handleSearch.bind(this);
        this.setExpanded = this.setExpanded.bind(this);
        this.logoutDash = this.logoutDash.bind(this);
        this.getTab = this.getTab.bind(this);
        this.getCats = this.getCats.bind(this);
        this.changeCat = this.changeCat.bind(this);
        this.changeTab = this.changeTab.bind(this);
        this.dismissCopy = this.dismissCopy.bind(this);
        this.closeCopy = this.closeCopy.bind(this);
        this.saveEdit = this.saveEdit.bind(this);
        this.renderCat = this.renderCat.bind(this);
    }





    renderCat() {
        let cats = this.getCats();
        let selectedCat = this.state.catselected;
        //console.log("Selected cat: "+ selectedCat);
        if ( selectedCat === 0 )
        {
            let passwords = this.renderLines(cats);
            let final = cats.map(function (cat) {
                return (
                    <div key={cat.id} >
                        <strong>{cat.name}</strong>
                        <br/>
                        {cat.desc}
                        <hr/>
                        {passwords[cat.name]}
                    </div>
                );
            });

            return (
                <>
                    <h5>Alle Kategorien</h5>
                    <hr/>
                    {final}
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
                    {passwords[cat.name]}
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

    renderLines(cats) {
        let passwords = {};
        for ( let i = 0; i < cats.length; i++ ) {
            //out += <b>{cats[i].name}</b>
            let catName = cats[i].name;
            //TODO mocking Object
            let catData = MockPasswords.getCatData(catName);
            // add callback to array
            catData = this.addCallback(catData);
            console.log("Data");
            console.log(catData);
            passwords[catName] = catData.map(function (singlePass) {
                function correctUrl(imgUrl) {

                    let out = "http://"+extractHostname(imgUrl);
                    if ( out.charAt(out.length-1) !== "/" )
                    {
                        out += "/"
                    }
                    return out;
                }

                function extractHostname(url) {
                    let hostname;
                    //find & remove protocol (http, ftp, etc.) and get hostname
                    if (url.indexOf("//") > -1) {
                        hostname = url.split('/')[2];
                    }
                    else {
                        hostname = url.split('/')[0];
                    }

                    //find & remove port number
                    hostname = hostname.split(':')[0];
                    //find & remove "?"
                    hostname = hostname.split('?')[0];

                    return hostname;
                }


                let imgSrc = correctUrl(singlePass.url);
                console.log("Vor dem rendern");
                return (
                    <PassLine key={singlePass.id} tag={singlePass.tag} img={imgSrc} id={singlePass.id} cat={singlePass.cat} title={singlePass.title} user={singlePass.user} pass={singlePass.pass} url={singlePass.url} callback={singlePass.callback}/>
                );
            })
        }
        return passwords;
    }


    closeCopy(which) {
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
        }
    }


    printCopy() {
        const show = this.state.showCopyAlert;
        return (
            <Alert show={show} variant="success" className="center-horz center-vert error fixed-top-easypass in-front"
                   onClose={() => this.closeCopy("showCopyAlert")}>
                <p className="center-horz center-vert center-text">
                    Passwort wurde in die Zwischenablage kopiert!
                </p>
            </Alert>
        );
    }

    printUser() {
        const show = this.state.showCopyUsernameAlert;
        return (
            <Alert show={show} variant="success" className="center-horz center-vert error fixed-top-easypass in-front"
                   onClose={() => this.closeCopy("showCopyUsernameAlert")}>
                <p className="center-horz center-vert center-text">
                    Username wurde in die Zwischenablage kopiert!
                </p>
            </Alert>
        );
    }

    dismissCopy( which ) {
        sleep(1250).then(() => {
                switch (which) {
                    case "showCopyAlert":
                        this.setState({showCopyAlert: false});
                        break;
                    case "showCopyUsernameAlert":
                        this.setState({showCopyUsernameAlert: false});
                        break;
                }
            }
        );

    }

    clipboardCopy( text ) {
        // Create new element
        let el = document.createElement('textarea');
        el.value = text;
        el.setAttribute('readonly', '');
        el.style = {display: 'none',};
        document.body.appendChild(el);
        el.select();
        el.setSelectionRange(0, 99999);
        // Copy text to clipboard
        document.execCommand('copy');
        // Remove temporary element
        document.body.removeChild(el);
    }

    copy( toCopy, which ) {
        switch (which) {
            case dashboardAlerts.showCopyUsernameAlert:
                this.setState({
                    showCopyUsernameAlert: true,
                });
                this.dismissCopy(dashboardAlerts.showCopyUsernameAlert);
                break;
            case dashboardAlerts.showCopyURLAlert:
                this.setState({
                    showCopyURLAlert: true,
                });
                this.dismissCopy(dashboardAlerts.showCopyURLAlert);
                break;
        }

        this.clipboardCopy(toCopy);
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

    goToPage(url) {
        function correctUrl(url) {
            let out = url;
            if (!( url.includes("https://") || url.includes("https://") )) {
                out = "https://" + url;
            }
            return out;
        }
        // TODO Mockobjekt
        window.open(correctUrl(url), "_blank");
        // Popup starten
        this.setState({
            showCopyAlert: true,
        });
        this.dismissCopy("showCopyAlert");
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
        alert("Test");
    }

    setExpanded() {
        this.setState({
            expanded: !this.state.expanded
        })
    }

    setSettingExpandedFalse() {
        this.setState({
            settingsExanded: false
        });
    }
    setSettingExpanded() {
        this.setState({
            settingsExanded: !this.state.settingsExanded
        });
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

    deletePass(id) {
        // ToDO call Kacper method
    }

    saveEdit(id, userNew, passwordNew, urlNew, titleNew, catNew, tagNew) {
        // ToDo call Kacper method
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

        let mainClasses = "fixMain";
        if ( this.state.expanded )
        {
            mainClasses = "fixMain expanded"
        }

        return (
            <div className="size-hole-window-hidden-scroll">
                <NavbarEP callback={this} />
                <div className="container-fluid fixScroll">
                    <Row>
                        <NavbarVerticalEP2 callback={this} />
                        <Col md={9} sm={7} xs={7} lg={9} className={mainClasses}>
                            {this.getTab()}
                        </Col>
                        <hr/>
                        <IndicatorSide />
                    </Row>
                </div>
                {this.printCopy()}
                {this.printUser()}
            </div>
        );
    }
}

const mapDispatchToProps3 = (dispatch) => {
    return {
        login: (creds) => dispatch(login(creds)),
        logout: () => dispatch(logout()),
        saveTab: (tabselected) => dispatch(saveTab(tabselected)),
        saveCat: (tabselected, catselected) => dispatch(saveCat(tabselected, catselected))
    }
};

const mapStateToProps3 = (state) => {
    console.log("State in save");
    console.log(state);
    return{
        loggedIn: state.auth.loggedIn
    }
};


function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

export default connect(mapStateToProps3, mapDispatchToProps3, null, { pure: false})(Dashboard)