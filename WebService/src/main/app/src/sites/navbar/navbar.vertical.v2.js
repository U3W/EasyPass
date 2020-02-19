import React from "react"
import {Button, Col} from "react-bootstrap";
import Row from "react-bootstrap/Row";
import tabs from "../dashboard/tabs/tab.enum";
import IndicatorBot from "../../network/network.indicator.bottombar";
import dashboardState from "../dashboard/dashboard.saved.state";
// Icons
import AddCat from "../../img/icons/password_add_tag.svg";
import EditCat from "../../img/icons/password_edit_white.svg";
import DeleteCat from "../../img/icons/dashboard_deleteCat_white.svg";
import OpenSidebar from "../../img/icons/sidebar_open.svg";
import CloseSidebar from "../../img/icons/sidebar_close.svg";
import StringSelector from "../../strings/stings";

class NavbarVerticalEP2 extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sidebarClosed: dashboardState.getSidebarClosed(),
            sidebarFlag: true,
            // with, height
            width: 0,
            height: 0,
        };

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
        if ( this.state.sidebarFlag && window.innerWidth < 680 ) {
            this.setClose(true);
            this.setState({
                sidebarFlag: false,
            });
        }
        else if ( window.innerWidth > 680 ) {
            if ( !this.state.sidebarFlag )
            {
                this.setClose(false);
                this.setState({
                    sidebarFlag: true,
                });
            }
        }
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    }

    setClose( to ) {
        this.setState({
            sidebarClosed: to,
        });
        this.props.callback.setSidebarState(to);
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

    returnCatBase ( id, name, catselected) {
        let getActive = "nav-link-kat sec";
        console.log("In return base", this.props.callback.state.catselected, id);
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
        let catselected = this.props.callback.state.catselected;
        if ( this.props.callback.state.tabselected === tabs.GROUPPASS ) {
            catselected = dashboardState.getCatGroup();
        }
        let getActive = "nav-link-kat fitparentWidth";
        if ( catselected === "0")
        {
            getActive = "nav-link-kat fitparentWidth active";
        }
        // always
        let start = (<li key={0} className="d-flex align-items-center text-muted clickable nav-link-kat-click" onClick={() => this.catChange("0")}>
                        <div className={getActive}>
                            {StringSelector.getString(this.props.callback.state.language).catsAllCat}
                        </div>
                    </li>);
        // single cat.
        let cats = this.props.callback.getCats();
        if ( this.props.callback.state.tabselected === tabs.GROUPPASS ) {
            cats = this.props.callback.getCatsForGroup(this.props.callback.state.groupselected);
        }
        /*
        for ( let i = 0; i < cats.length; i++ )
        {
            cats[i].idCat = i+1;
        }*/
        // counter for the cats
        let finalCats = cats.map((item) =>
            this.returnCatBase(item._id, item.name, catselected)
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
        return (
            <>
                <li key={0} className="d-flex align-items-center text-muted clickable nav-link-kat-click"
                    onClick={() => this.props.callback.showAddCat()}>
                    <div className="nav-link-kat fitparentWidth">
                        {StringSelector.getString(this.props.callback.state.language).addCat}
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
                <li key={1} className="d-flex align-items-center text-muted clickable nav-link-kat-click"
                    onClick={() => this.props.callback.showEditCat()}>
                    <div className="nav-link-kat fitparentWidth">
                        {StringSelector.getString(this.props.callback.state.language).editCat}
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
                <li key={2} className="d-flex align-items-center text-muted clickable nav-link-kat-click"
                    onClick={() => this.props.callback.showDeleteCat()}>
                    <div className="nav-link-kat fitparentWidth">
                        {StringSelector.getString(this.props.callback.state.language).delCat}
                        <Button variant="dark" className="catButton round">
                            <img
                                src={DeleteCat}
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
    }


    render() {
        const tabselected = this.props.callback.state.tabselected;

        let sidebarToggle = CloseSidebar;
        let classes = "col-md-3 col-sm-5 col-5 d-none d-sm-block bg-light sidebar animateTransform " + this.props.className;
        let classesIntern = "sidebar-sticky animateTransformWidth";
        if ( this.state.sidebarClosed ) {
            sidebarToggle = OpenSidebar;
            classes += " sidebarClosed";
            classesIntern += " sidebarClosedMore";
        }
        return (
            <>
                <nav className={classes}>
                    <button type="button" className="sidebarToggle clickable btn btn-light" onClick={() => this.setClose(!this.state.sidebarClosed)}>
                        <div>
                            <img
                                src={sidebarToggle}
                                alt=""
                                width="15"
                                height="15"
                                className="sidebarToggleImg d-inline-block"
                            />
                        </div>
                    </button>
                    <div className={classesIntern}>
                        <ul className="nav flex-column">
                            <h1 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-1 mb-1 text-muted">
                                <span>{StringSelector.getString(this.props.callback.state.language).menu}</span>
                            </h1>
                            <hr />
                            {tabselected === tabs.PRIVPASS ?
                                    (<li className="d-flex align-items-center text-muted clickable nav-link-click active" id="privPassword" onClick={() => this.tabChange(tabs.PRIVPASS)}>
                                        <div className="nav-link active">
                                            <div className="d-inline-block feather" id="privPasswordIcon" />
                                            {StringSelector.getString(this.props.callback.state.language).privPass}
                                        </div>
                                    </li>)
                                    :
                                    (<li className="d-flex align-items-center text-muted clickable nav-link-click"  id="privPassword" onClick={() => this.tabChange(tabs.PRIVPASS)}>
                                        <div className="nav-link">
                                            <div className="d-inline-block feather" id="privPasswordIcon" />
                                            {StringSelector.getString(this.props.callback.state.language).privPass}
                                        </div>
                                    </li>)
                            }

                            {tabselected === tabs.GROUPPASS ?
                                (<li className="d-flex align-items-center text-muted clickable nav-link-click active" id="groupPassword" onClick={() => this.tabChange(tabs.GROUPPASS)}>
                                    <div className="nav-link active" >
                                        <div className="d-inline-block feather" id="groupPasswordIcon" />
                                        {StringSelector.getString(this.props.callback.state.language).groupPass}
                                    </div>
                                </li>)
                                :
                                (<li className="d-flex align-items-center text-muted clickable nav-link-click" id="groupPassword" onClick={() => this.tabChange(tabs.GROUPPASS)}>
                                    <div className="nav-link" >
                                        <div className="d-inline-block feather" id="groupPasswordIcon" />
                                        {StringSelector.getString(this.props.callback.state.language).groupPass}
                                    </div>
                                </li>)
                            }
                        </ul>
                        { (this.props.callback.state.groupselected !== "0" && this.props.callback.state.tabselected === tabs.GROUPPASS || this.props.callback.state.tabselected === tabs.PRIVPASS) &&
                            <ul className="nav flex-column">
                                <h6 className="d-flex justify-content-between align-items-center px-3 mt-1 mb-1 text-muted fixKat">
                                    <span>{StringSelector.getString(this.props.callback.state.language).cats}</span>
                                </h6>
                                <hr />
                                {this.getCat()}
                                <hr />
                                {this.getEditCat()}
                            </ul>
                        }
                    </div>
                </nav>
                {/* Bottom Navbar */}
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