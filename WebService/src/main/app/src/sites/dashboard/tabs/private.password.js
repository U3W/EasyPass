import React from "react"
import {PassLine} from "../line.temp";

class PrivatePassword extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <>
                <h1>Private Passwörter</h1>
                <div className="panel-group" id="accordion">
                    <PassLine />
                </div>
            </>
        );
    };

}

export default PrivatePassword;