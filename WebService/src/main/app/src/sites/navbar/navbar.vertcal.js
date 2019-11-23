import React from "react"
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import FormControl from "react-bootstrap/FormControl";
import Row from "react-bootstrap/Row";
import Dashboard from "../dashboard/dashboard";
import NavbarEP from "../navbar/navbar"
class NavbarVerticalEP extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="navbarback grow fitparentHeight" >
                <Row className="noMarginRight navbarvertActive clickable">
                    <a className="center-horz">Hello</a>
                </Row>
                <Row className="noMarginRight navbarvert clickable">
                    <a className="center-horz">Hello</a>
                </Row>
                <Row className="noMarginRight navbarvert clickable">
                    <a className="center-horz">Hello</a>
                </Row>
            </div>
        );
    }

}

export default NavbarVerticalEP;