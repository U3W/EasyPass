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
import {PassLine} from "./line.temp";
import {authConstants as dashboardConst, authConstants} from "../../authentification/auth.const.localstorage";
import {
    saveCat,
    saveTab
} from "../../action/dashboard.action";
import dashboardState from "./dashboard.saved.state"
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
            expanded: false
        };


        this.handleSearch = this.handleSearch.bind(this);
        this.setExpanded = this.setExpanded.bind(this);
        this.logoutDash = this.logoutDash.bind(this);
        this.getTab = this.getTab.bind(this);
        this.getCats = this.getCats.bind(this);
        this.changeCat = this.changeCat.bind(this);
        this.changeTab = this.changeTab.bind(this);
    }

    fixStorage() {
        if (localStorage.getItem(dashboardConst.tabselected) == null) {
            console.log("Neusetzten: ");
            localStorage.setItem(dashboardConst.tabselected, JSON.stringify(tabs.PRIVPASS));
        }
        if (localStorage.getItem(dashboardConst.catselectedPriv) == null){
            console.log("Neusetzten: ");
            localStorage.setItem(dashboardConst.catselectedPriv, JSON.stringify(0)); // 0 für Alle Kat
        }
        if (localStorage.getItem(dashboardConst.catselectedGroup) == null){
            console.log("Neusetzten: ");
            localStorage.setItem(dashboardConst.catselectedGroup, JSON.stringify(0)); // 0 für Alle Kat
        }
    }

    renderCat() {
        let cats = this.getCats();
        let selectedCat = this.state.catselected;
        console.log("Cats");
        console.log(cats);
        //console.log("Selected cat: "+ selectedCat);
        if ( selectedCat === 0 )
        {
            let passwords = this.renderLines(cats);
            let final = cats.map(function (cat) {
                console.log("Einzelne Cat");
                console.log(cat);
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
            console.log(selectedCat);
            let cat = cats[selectedCat-1];
            console.log("Einzelne Cat");
            console.log(cat);
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
            passwords[catName] = catData.map(function (singleCat) {
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


                let imgSrc = correctUrl(singleCat.url);
                console.log("Vor dem rendern");
                return (
                    <PassLine key={singleCat.id} img={imgSrc} id={singleCat.id} title={singleCat.title} user={singleCat.user} pass={singleCat.pass} url={singleCat.url} callback={singleCat.callback}/>
                );
            })
        }
        return passwords;
    }

    copyPass(id) {
        console.log("Password");

    }

    goToPage(id) {
        function correctUrl(url) {
            let out = url;
            if (!( url.includes("https://") || url.includes("https://") )) {
                out = "https://" + url;
            }
            return out;
        }
        // TODO Mockobjekt
        window.open(correctUrl("https://login.live.com/login.srf?wa=wsignin1.0&rpsnv=13&ct=1573646035&rver=7.0.6737.0&wp=MBI_SSL&wreply=https%3a%2f%2foutlook.live.com%2fowa%2f%3fnlp%3d1%26RpsCsrfState%3da992ae5f-b164-bd0f-15d4-cca75d3498f8&id=292841&aadredir=1&CBCXT=out&lw=1&fl=dob%2cflname%2cwld&cobrandid=90015"), "_blank");
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

export default connect(mapStateToProps3, mapDispatchToProps3, null, { pure: false})(Dashboard)