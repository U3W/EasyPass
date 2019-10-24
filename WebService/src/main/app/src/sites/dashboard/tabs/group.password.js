import React from "react"
import {PassCard} from "../card.temp";
import {ProtectedRoute} from "../../../routing/ProtectedRoute";
import Dashboard from "../dashboard";
import Logo from "../../../img/logo/LogoV2.svg"
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {Container} from "react-bootstrap";

class GroupPassword extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <>
               <h1>Group Passwords</h1>
                <Container>
                    <hr/>
                    <Row>
                        <Col md={6} lg={4}><PassCard title="Test" pass="test" user="test-user" img={Logo} /></Col>
                        <Col md={6} lg={4}><PassCard title="Test" pass="test" user="test-user" img={Logo} /></Col>
                        <Col md={6} lg={4}><PassCard title="Test" pass="test" user="test-user" img={Logo} /></Col>
                    </Row>
                    <Row>
                        <Col><PassCard title="Test" pass="test" user="test-user" img={Logo} /></Col>
                        <Col><PassCard title="Test" pass="test" user="test-user" img={Logo} /></Col>
                        <Col><PassCard title="Test" pass="test" user="test-user" img={Logo} /></Col>
                    </Row>
                </Container>
            </>
        );
    }

}

export default GroupPassword;