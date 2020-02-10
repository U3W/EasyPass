import React from "react"
import {PassLine} from "../line.temp";
import Accordion from "react-bootstrap/Accordion";
import {Container} from "react-bootstrap";
import MockPasswords from "../MockPasswords";
import StringSelector from "../../../strings/stings";

class PrivatePassword extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        // url zum favcon holen: https://www.google.com/s2/favicons?domain=
        return (
            <>
                <h1 className="fixHeader">{StringSelector.getString(this.props.callback.state.language).mainPassPriv}</h1>
                <hr/>
                <Container>
                    <Accordion id="passwords">
                        {this.props.callback.renderCat()}
                    </Accordion>
                </Container>
            </>
        );
    };

}

export default PrivatePassword;