import React from "react"
import {Button, Col} from "react-bootstrap";
import Row from "react-bootstrap/Row";
import groupPass from "../../img/icons/tab_group_password.svg"
import privPass from "../../img/icons/tab_password.svg"
import logoutImg from "../../img/icons/logout.svg";
import tabs from "../dashboard/tabs/tab.enum";
import IndicatorBot from "../../network/network.indicator.bottombar";

// Icons
import AddCat from "../../img/icons/password_add_tag.svg";
import EditCat from "../../img/icons/password_edit_white.svg"

class NavbarVerticalEP2 extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            catCounter: 1,
        };

    }

    /**
     * @param changeTo: Ein Int aus der tab.enum.js tabs Enum
     */
    tabChange( changeTo ) {
        this.props.callback.changeTab(changeTo);
    };

    catChange( changeTo ) {
        this.props.callback.changeCat(changeTo);
    }

    returnCatBase ( id, name) {
        let getActive = "nav-link-kat sec";
        if ( this.props.callback.state.catselected === id)
        {
            getActive = "nav-link-kat sec active";
        }

        return (
            <li key={id} className="d-flex align-items-center text-muted clickable nav-link-kat-click" onClick={() => this.catChange(id)}>
                <div className={getActive}>
                    {name}
                </div>
            </li>
        );
    }


    getCat() {
        let getActive = "nav-link-kat fitparentWidth";
        if ( this.props.callback.state.catselected === 0)
        {
            getActive = "nav-link-kat fitparentWidth active";
        }
        // always
        let start = (<li key={0} className="d-flex align-items-center text-muted clickable nav-link-kat-click" onClick={() => this.catChange(0)}>
                        <div className={getActive}>
                            Alle Kategorien
                        </div>
                    </li>);
        // single cat.
        let cats = this.props.callback.getCats();
        for ( let i = 0; i < cats.length; i++ )
        {
            cats[i].idCat = i+1;
        }
        // counter for the cats
        let finalCats = cats.map((item) =>
            this.returnCatBase(item.idCat, item.name)
        );
        // loop with onClick={() => this.catChange(i)}> --> i++
        return (
            <>
                {start}
                {finalCats}
            </>
        );
    }

    getEditCat() {
        let out = (
            <>
                <li key={0} className="d-flex align-items-center text-muted clickable nav-link-kat-click" onClick={() => this.props.callback.setPopUpAddCatEnabled()}>
                    <div className="nav-link-kat fitparentWidth" >
                        Kategorie hinzufügen
                        <Button variant="dark" className="catButton round">
                            <img
                                src={AddCat}
                                alt=""
                                width="10"
                                height="10"
                                className="d-inline-block"
                            />
                        </Button>
                    </div>
                </li>
                <li key={1} className="d-flex align-items-center text-muted clickable nav-link-kat-click" onClick={() => alert("Bearbeiten")}>
                    <div className="nav-link-kat fitparentWidth" >
                        Kategorie bearbeiten
                        <Button variant="dark" className="catButton round">
                            <img
                                src={EditCat}
                                alt=""
                                width="10"
                                height="10"
                                className="d-inline-block"
                            />
                        </Button>
                    </div>
                </li>
            </>
        );

        return out;
    }


    render() {
        const tabselected = this.props.callback.state.tabselected;
        return (
            <>
                <nav className="col-md-3 col-sm-5 col-5 d-none d-sm-block bg-light sidebar">
                    <div className="sidebar-sticky">
                        <ul className="nav flex-column">
                            <h1 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-1 mb-1 text-muted">
                                <span>Menü</span>
                            </h1>
                            <hr />
                            {tabselected === tabs.PRIVPASS ?
                                    (<li className="d-flex align-items-center text-muted clickable nav-link-click active" id="privPassword" onClick={() => this.tabChange(tabs.PRIVPASS)}>
                                        <div className="nav-link active">
                                            <div className="d-inline-block feather" id="privPasswordIcon" />
                                            Private Passwords
                                        </div>
                                    </li>)
                                    :
                                    (<li className="d-flex align-items-center text-muted clickable nav-link-click"  id="privPassword" onClick={() => this.tabChange(tabs.PRIVPASS)}>
                                        <div className="nav-link">
                                            <div className="d-inline-block feather" id="privPasswordIcon" />
                                            Private Passwords
                                        </div>
                                    </li>)
                            }

                            {tabselected === tabs.GROUPPASS ?
                                (<li className="d-flex align-items-center text-muted clickable nav-link-click active" id="groupPassword" onClick={() => this.tabChange(tabs.GROUPPASS)}>
                                    <div className="nav-link active" >
                                        <div className="d-inline-block feather" id="groupPasswordIcon" />
                                        Group Passwords
                                    </div>
                                </li>)
                                :
                                (<li className="d-flex align-items-center text-muted clickable nav-link-click" id="groupPassword" onClick={() => this.tabChange(tabs.GROUPPASS)}>
                                    <div className="nav-link" >
                                        <div className="d-inline-block feather" id="groupPasswordIcon" />
                                        Group Passwords
                                    </div>
                                </li>)
                            }
                        </ul>

                        <ul className="nav flex-column">
                            <h6 className="d-flex justify-content-between align-items-center px-3 mt-1 mb-1 text-muted fixKat">
                                <span>Kategorien</span>
                            </h6>
                            <hr />
                            {this.getCat()}
                            <hr />
                            {this.getEditCat()}
                        </ul>

                    </div>
                </nav>
                <nav id="navbar-bot" className="bottom navbar fixed-bottom navbar-expand-sm navbar-dark bg-dark">
                    <IndicatorBot />
                    <Row>
                        {tabselected === tabs.PRIVPASS ?
                            (<Col id="privPassword" className="active" align="center" onClick={() => this.tabChange(tabs.PRIVPASS)}>
                                <a className="nav-link clickable">
                                    <div className="d-inline-block feather" id="privPasswordIcon" />
                                </a>
                            </Col>)
                            :
                            (<Col id="privPassword" align="center" onClick={() => this.tabChange(tabs.PRIVPASS)}>
                                <a className="nav-link clickable">
                                    <div className="d-inline-block feather" id="privPasswordIcon" />
                                </a>
                            </Col>)
                        }
                        {tabselected === tabs.GROUPPASS ?
                            (<Col id="groupPassword" className="active" align="center" onClick={() => this.tabChange(tabs.GROUPPASS)}>
                                <a className="nav-link clickable" >
                                    <div className="d-inline-block feather" id="groupPasswordIcon" />
                                </a>
                            </Col>)
                            :
                            (<Col id="groupPassword"  align="center" onClick={() => this.tabChange(tabs.GROUPPASS)}>
                                <a className="nav-link clickable" >
                                    <div className="d-inline-block feather" id="groupPasswordIcon" />
                                </a>
                            </Col>)
                        }

                    </Row>
                </nav>
            </>
        );
    }

}

export default NavbarVerticalEP2;