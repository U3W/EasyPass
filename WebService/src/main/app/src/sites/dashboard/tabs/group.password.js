import React from "react"
import GroupCard from "../card.temp";
import {ProtectedRoute} from "../../../routing/ProtectedRoute";
import Dashboard from "../dashboard";
import Logo from "../../../img/logos/LogoV2.svg"
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {Container} from "react-bootstrap";
import Accordion from "react-bootstrap/Accordion";
import StringSelector from "../../../strings/stings";

class GroupPassword extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
               <h1 className="fixHeader">{StringSelector.getString(this.props.callback.state.language).groupPass}</h1>
                <hr/>
                <Container className="fixContainer">
                    <Accordion id="passwords">
                        {this.props.callback.renderGroup()}
                    </Accordion>
                </Container>
            </>
        );
    }

}

export default GroupPassword;