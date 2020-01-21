import "./network.indicator.bottombar.css"
import React from "react"
import {Online, Offline} from "react-detect-offline";
class IndicatorBot extends React.Component {
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
                <div className="offline-ui-bot    offline-ui-bot-up ">
                    <div className="offline-ui-bot-content" data-retry-in-value="null" data-retry-in-unit="null"/>
                    <a href="" className="offline-ui-bot-retry"/>
                </div>
            );
        }
        else
        {
            render = (
                <div className="offline-ui-bot    offline-ui-bot-down ">
                    <div className="offline-ui-bot-content" data-retry-in-value="null" data-retry-in-unit="null"/>
                    <a href="" className="offline-ui-bot-retry"/>
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

export default IndicatorBot;