import React from "react"
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import OpenGroup from "../../img/icons/group_open.svg";
import "./card.temp.css"
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import StringSelector from "../../strings/stings";
import SaveChanges from "../../img/icons/password_savechanges_white.svg";
import DeleteIcon from "../../img/icons/password_delete_white.svg";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import EditIcon from "../../img/icons/password_edit_white.svg";
import GroupReturn from "../../img/icons/group_return.svg";
import PassLine from "./line.temp";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Accordion from "react-bootstrap/Accordion";

// Nach dem machen --> https://www.youtube.com/watch?v=rH9jM-8hAD8
/**
 * @param id: which element in a list f.e. (must be unique, because with this id the collapsible div will be opened then toggled)
 * @param name
 * @param rest
 */
export default class SingleGroup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: this.props.name,
            userGroupList: this.deepCopy(this.props.userGroupList),
            id: this.props._id,
            rev: this.props._rev,
        };



        this.renderGroups = this.renderGroups.bind(this);

    }

    deepCopy( toCopy ) {
        let out = [];
        if ( toCopy !== undefined ) {
            for ( let i = 0; i < toCopy.length; i++ ) {
                out[i] = JSON.parse(JSON.stringify(toCopy[i]));
            }
        }
        return out;
    }

    renderGroups() {
        let out1, out2;

        let singLen = Math.ceil(this.state.userGroupList.length / 2);

        let arr1 = [];
        let arr2 = [];
        if ( this.state.userGroupList.length <= 2 ) {
            if ( this.state.userGroupList[0] !== undefined ) {
                arr1 = [this.state.userGroupList[0]];
            }
            if ( this.state.userGroupList[1] !== undefined ) {
                arr2 = [this.state.userGroupList[1]];
            }
        }
        else {
            arr1 = this.state.userGroupList.slice(0, singLen);
            arr2 = this.state.userGroupList.slice(singLen);
        }

        let i = -1;
        if ( arr1.length !== 0 ) {
            out1 = arr1.map((item) => {
                i++;
                return (
                    <li key={i}><b>{item}</b></li>
                );
            });
        }
        if ( arr2.length !== 0 ) {
            out2 = arr2.map((item) => {
                i++;
                return (
                    <li key={i}><b>{item}</b></li>
                );
            });
        }

        return (
            <Row>
                <Col>
                    <ul>
                        {out1}
                    </ul>
                </Col>
                <Col>
                    <ul>
                        {out2}
                    </ul>
                </Col>
            </Row>
        )
    }

    render() {
        let editBut = (
            <>
                {['bottom'].map(placement => (
                    <OverlayTrigger
                        key={placement}
                        placement={placement}
                        overlay={
                            <Tooltip id={`tooltip-${placement}`}>
                                {StringSelector.getString(this.props.callback.state.language).cardEdit}
                            </Tooltip>
                        }
                    >
                        <Button variant="dark" className="groupReturnButton buttonSpace " onClick={() => this.props.callback.triggerEditGroup( this.state.id, this.state.rev, this.state.name, this.state.userGroupList)}>
                            <img
                                src={EditIcon}
                                alt=""
                                className="groupReturnIcon"
                            />
                        </Button>
                    </OverlayTrigger>
                ))}
            </>
        );

        let delBut = (
            <>
                {['bottom'].map(placement => (
                    <OverlayTrigger
                        key={placement}
                        placement={placement}
                        overlay={
                            <Tooltip id={`tooltip-${placement}`}>
                                {StringSelector.getString(this.props.callback.state.language).cardDel}
                            </Tooltip>
                        }
                    >
                        <Button variant="dark" className="groupReturnButton buttonSpace " onClick={() => this.props.callback.deleteGroup(this.state.id, this.state.rev, false)}>
                            <img
                                src={DeleteIcon}
                                alt=""
                                className="groupReturnIcon"
                            />
                        </Button>
                    </OverlayTrigger>
                ))}
            </>
        );

        if ( !this.props.isAdmin ) {
            editBut = (
                <>
                    {['bottom'].map(placement => (
                        <OverlayTrigger
                            key={placement}
                            placement={placement}
                            overlay={
                                <Tooltip id={`tooltip-${placement}`}>
                                    {StringSelector.getString(this.props.callback.state.language).cardDis}
                                </Tooltip>
                            }
                        >
                            <Button variant="dark" className="groupReturnButton buttonSpace disButton">
                                <img
                                    src={EditIcon}
                                    alt=""
                                    className="groupReturnIcon"
                                />
                            </Button>
                        </OverlayTrigger>
                    ))}
                </>
            );

            delBut = (
                <>
                    {['bottom'].map(placement => (
                        <OverlayTrigger
                            key={placement}
                            placement={placement}
                            overlay={
                                <Tooltip id={`tooltip-${placement}`}>
                                    {StringSelector.getString(this.props.callback.state.language).cardDis}
                                </Tooltip>
                            }
                        >
                            <Button variant="dark" className="groupReturnButton buttonSpace disButton" >
                                <img
                                    src={DeleteIcon}
                                    alt=""
                                    className="groupReturnIcon"
                                />
                            </Button>
                        </OverlayTrigger>
                    ))}
                </>
            );
        }
        return (
            <>
                <Row>
                    <Col>
                        <h5>{this.state.name}</h5>
                    </Col>
                    <Col className="center-vert">
                        <div className="float-right">
                            {delBut}
                            {editBut}
                            {['bottom'].map(placement => (
                                <OverlayTrigger
                                    key={placement}
                                    placement={placement}
                                    overlay={
                                        <Tooltip id={`tooltip-${placement}`}>
                                            {StringSelector.getString(this.props.callback.state.language).cardReturn}
                                        </Tooltip>
                                    }
                                >
                                    <Button variant="dark" className="groupReturnButton buttonSpace " onClick={() => this.props.callback.changeGroup("0", "0")}>
                                        <img
                                            src={GroupReturn}
                                            alt=""
                                            className={"groupReturnIcon"}
                                        />
                                    </Button>
                                </OverlayTrigger>
                            ))}

                        </div>
                    </Col>
                </Row>
                <br/>
                <Tabs defaultActiveKey="pass" id="uncontrolled-tab-example">
                    <Tab eventKey="pass" title={StringSelector.getString(this.props.callback.state.language).cardGroupPassTab}>
                        <br/>
                        <Col>
                            {this.props.callback.renderGroupCat()}
                        </Col>
                    </Tab>
                    <Tab eventKey="group" title={StringSelector.getString(this.props.callback.state.language).cardGroupMembersTab}>
                        <Col>
                            <Row className="groupPadding">
                                <Col>
                                    <b>{StringSelector.getString(this.props.callback.state.language).cardGroupMembers}</b>
                                </Col>
                            </Row>
                            {this.renderGroups()}
                        </Col>
                    </Tab>
                </Tabs>
            </>
        )
    }
};