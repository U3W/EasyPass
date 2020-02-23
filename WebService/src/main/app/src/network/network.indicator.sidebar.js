import "./network.indicator.sidebar.css"
import React from "react"
import {Online, Offline} from "react-detect-offline";
import Col from "react-bootstrap/Col";
import {IndicatorEnum} from "../index";

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
        let classes = this.props.className;
        if ( this.state.online ) {
            classes += " d-none d-sm-block offline-ui-side offline-ui-side-up";
            render = (
                <Col sm={5} md={3} xs={5} className={classes}>
                    <div className="offline-ui-side-content" data-retry-in-value="null" data-retry-in-unit="null"/>
                    <a href="" className="offline-ui-side-retry"/>
                </Col>
            );
        }
        else
        {
            classes += " d-none d-sm-block offline-ui-side offline-ui-side-down";
            render = (
                <Col sm={5} md={3} xs={5} className={classes}>
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