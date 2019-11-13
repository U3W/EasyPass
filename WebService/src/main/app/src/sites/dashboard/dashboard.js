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
import {authConstants} from "../../authentification/auth.const.localstorage";

class Dashboard extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            search: "",
            username: "Username",
            tabselected: tabs.PRIVPASS,
            catselected: 0, // für Alle Kat
            expanded: false
        };

        localStorage.setItem(authConstants.verified, "true");



        this.handleSearch = this.handleSearch.bind(this);
        this.setExpanded = this.setExpanded.bind(this);
        this.logoutDash = this.logoutDash.bind(this);
        this.getTab = this.getTab.bind(this);
        this.getCats = this.getCats.bind(this);
        this.getSelectedCat = this.getSelectedCat.bind(this);
    }

    renderCat() {
        let out;

        let cats = this.getCats();
        let selectedCat = this.getSelectedCat();
        console.log(cats);
        console.log("Selected cat: "+ selectedCat);
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
        return out;
    }

    renderLines(cats) {
        let passwords = {};
        for ( let i = 0; i < cats.length; i++ ) {
            //out += <b>{cats[i].name}</b>
            let catName = cats[i].name;
            //TODO mocking Object
            let catData = MockPasswords.getCatData(catName);
            console.log("Data");
            console.log(catData);
            passwords[catName] = catData.map(function (singleCat) {
                function correctUrl(imgUrl) {

                    let out = "http://"+extractHostname(imgUrl);
                    /*
                    if (!( imgUrl.includes("https://www") || imgUrl.includes("http://www") || imgUrl.includes("http://") || imgUrl.includes("https://"))) {
                        out = "https://www." + imgUrl;
                    }*/
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
                return (
                    <PassLine key={singleCat.id} img={imgSrc} id={singleCat.id} title={singleCat.title} user={singleCat.user} pass={singleCat.pass} url={singleCat.url}/>
                );
            })
        }
        return passwords;
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
        console.log("Changed to");
        console.log(changeTo);
        this.setState({
                tabselected: changeTo
            }
        );
    }

    changeCat( changeTo ) {
        this.setState({
            catselected: changeTo
        });
        console.log("Changed to");
        console.log(changeTo);
    }

    getSelectedCat() {
        return this.state.catselected;
    }

    /**
     * @returns [] a list with all the categories created by the user
     */
    getCats() {
        //TODO mocking Object
        return MockPasswords.getCats(this.state.tabselected);
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
        logout: () => dispatch(logout())
    }
};

const mapStateToProps3 = (state) => {
    console.log(state);
    return{
        loggedIn: state.auth.loggedIn
    }
};

export default connect(mapStateToProps3, mapDispatchToProps3, null, { pure: false})(Dashboard)