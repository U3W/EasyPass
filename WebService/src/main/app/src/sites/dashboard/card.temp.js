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

// Nach dem machen --> https://www.youtube.com/watch?v=rH9jM-8hAD8
/**
 * @param id: which element in a list f.e. (must be unique, because with this id the collapsible div will be opened then toggled)
 * @param name
 * @param rest
 */
export default class GroupCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: this.props.name,
            userGroupList: this.props.userGroupList,
            id: this.props._id,
            rev: this.props._rev,
        };

    }

    /* <input id="..." type="hidden" value="..."/>: Must be at the first position, otherwise the search function wont find it -> exception */
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
                        <Button variant="dark" className="groupButton" onClick={() => this.props.callback.triggerEditGroup( this.state.id, this.state.rev, this.state.name, this.state.userGroupList)}>
                            <img
                                src={EditIcon}
                                alt=""
                                className="groupIcons"
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
                        <Button variant="dark" className="groupButton" onClick={() => this.props.callback.deleteGroup(this.state.id, this.state.rev, false)}>
                            <img
                                src={DeleteIcon}
                                alt=""
                                className="groupIcons"
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
                            <Button variant="dark" className="groupButton disButton">
                                <img
                                    src={EditIcon}
                                    alt=""
                                    className="groupIcons"
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
                            <Button variant="dark" className="groupButton disButton">
                                <img
                                    src={DeleteIcon}
                                    alt=""
                                    className="groupIcons"
                                />
                            </Button>
                        </OverlayTrigger>
                    ))}
                </>
            );
        }
        return (
            <Card className="pass-card groupCard">
                <input id="searchInput" type="hidden" value={this.props.name}/>
                <Card.Body>
                    <Card.Title>
                        {this.props.name}
                    </Card.Title>
                    <h6>{StringSelector.getString(this.props.callback.state.language).cardGroupMembers} {this.state.userGroupList.length}</h6>

                    <Card.Footer className="spezFooter">
                        <Row>
                            <Col xs={4}>
                                {delBut}
                            </Col>
                            <Col xs={4}>
                                {editBut}
                            </Col>
                            <Col xs={4}>
                                {['bottom'].map(placement => (
                                    <OverlayTrigger
                                        key={placement}
                                        placement={placement}
                                        overlay={
                                            <Tooltip id={`tooltip-${placement}`}>
                                                {StringSelector.getString(this.props.callback.state.language).cardOpen}
                                            </Tooltip>
                                        }
                                    >
                                        <Button variant="dark" className="groupButton" onClick={() => this.props.callback.changeGroup(this.state.id, this.state.rev)}>
                                            <img
                                                src={OpenGroup}
                                                alt=""
                                                className="groupIcons"
                                            />
                                        </Button>
                                    </OverlayTrigger>
                                ))}
                            </Col>
                        </Row>
                    </Card.Footer>
                </Card.Body>
            </Card>
        )
    }
};