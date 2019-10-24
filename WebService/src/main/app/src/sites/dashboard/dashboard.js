import React from "react";
import {Col, Container, Nav, Navbar, Row} from "react-bootstrap";
import NavbarEP from "../navbar/navbar";
import "../navbar/navbar.css";
import "./dashboard.css";
import NavbarVerticalEP from "../navbar/navbar.vertcal";
import {connect} from "react-redux";
import {login, logout} from "../../action/auth.action";
import NavbarVerticalEP2 from "../navbar/navbar.vertical.v2";
import Indicator from "../../network/network.indicator";
import IndicatorSide from "../../network/network.indicator.sidebar";
import tabs from "./tabs/tab.enum";
import IndicatorBot from "../../network/network.indicator.bottombar";
import PrivatePassword from "./tabs/private.password";
import GroupPassword from "./tabs/group.password";

class Dashboard extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            username: "Username",
            tabselected: tabs.PRIVPASS,
            catselected: 0 // für Alle Kat
        };

        this.logoutDash = this.logoutDash.bind(this);
        this.getTab = this.getTab.bind(this);
    }

    logoutDash() {
        this.props.logout(this.state);
        this.props.history.push("/");
    }

    saveSettings() {
        alert("Test");
    }

    changeTab( changeTo ) {
        this.setState({
                tabselected: changeTo
            }
        );
    }

    changeCat( changeTo ) {
        this.setState({
            catselected: changeTo
        })
    }

    getTab() {
        let out;
        switch (this.state.tabselected) {
            case tabs.PRIVPASS:
                console.log("Im Priv");
                out = (<PrivatePassword/>);
                break;
            case tabs.GROUPPASS:
                out = (<GroupPassword/>);
                break;
        }

        return out;
    }

    render() {
        // <NavbarVerticalEP callback={this} />
        // <div className="size-hole-window">
        // ml-sm-auto col-lg-10 px-4
        return (
            <div className="size-hole-window-hidden-scroll">
                <NavbarEP callback={this} />
                <div className="container-fluid fixScroll">
                    <Row>
                        <NavbarVerticalEP2 callback={this} />
                        <Col md={9} sm={7} xs={7} lg={9} className="fixMain">
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