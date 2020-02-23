import "./network.indicator.css"
import React from "react"
import {Online, Offline} from "react-detect-offline";
import {IndicatorEnum} from "../index";
class Indicator extends React.Component {

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
                <div className="offline-ui    offline-ui-up ">
                    <div className="offline-ui-content" data-retry-in-value="null" data-retry-in-unit="null"/>
                    <a href="" className="offline-ui-retry"/>
                </div>
            );
        }
        else
        {
            render = (
                <div className="offline-ui    offline-ui-down ">
                    <div className="offline-ui-content" data-retry-in-value="null" data-retry-in-unit="null"/>
                    <a href="" className="offline-ui-retry"/>
                </div>
            );
        }
        return (
            <div>
                {render}
            </div>
        );
    }
}

export default Indicator;