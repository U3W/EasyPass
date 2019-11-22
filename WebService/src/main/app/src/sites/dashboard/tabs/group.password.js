import React from "react"
import {PassCard} from "../card.temp";
import {ProtectedRoute} from "../../../routing/ProtectedRoute";
import Dashboard from "../dashboard";
import Logo from "../../../img/logo/LogoV2.svg"
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {Container} from "react-bootstrap";
import {PassLine} from "../line.temp";
import Accordion from "react-bootstrap/Accordion";

class GroupPassword extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
               <h1 className="fixHeader">Group Passwords</h1>
                <hr/>
                <Container>
                    <Accordion id="passwords">
                        {this.props.callback.renderCat()}
                    </Accordion>
                </Container>
            </>
        );
    }

}

export default GroupPassword;