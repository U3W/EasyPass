import "./network.indicator.sidebar.css"
import React from "react"
import {Online, Offline} from "react-detect-offline";
import Col from "react-bootstrap/Col";

class IndicatorSide extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            online: true,
        };

        this.setOnline = this.setOnline.bind(this);
    }

    setOnline( state ) {
        this.setState({
            online: state
        });
    }


    render() {
        let render;
        if ( this.state.online ) {
            render = (
                <Col sm={5} md={3} xs={5} className="d-none d-sm-block offline-ui-side offline-ui-side-up">
                    <div className="offline-ui-side-content" data-retry-in-value="null" data-retry-in-unit="null"/>
                    <a href="" className="offline-ui-side-retry"/>
                </Col>
            );
        }
        else
        {
            render = (
                <Col sm={5} md={3} xs={5} className="d-none d-sm-block offline-ui-side offline-ui-side-down">
                    <div className="offline-ui-side-content" data-retry-in-value="null" data-retry-in-unit="null"/>
                    <a href="" className="offline-ui-side-retry"/>
                </Col>
            );
        }
        return (
            <>
                {render}
            </>
        );
    }
}

export default IndicatorSide;