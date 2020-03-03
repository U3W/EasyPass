import "./network.indicator.bottombar.css"
import React from "react"
import {Online, Offline} from "react-detect-offline";
import {IndicatorEnum} from "../index";
class IndicatorBot extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            online: true,
            show: false,
            first: false,
        };

        this.setOnline = this.setOnline.bind(this);

    }

    setOnline( state ) {
        if ( !this.state.show ) {
            this.setState({
                online: state,
                show: true,
            }, () => {
                setTimeout(() => this.setState({show: false}), 2000);
            });
        }
        else {
            setTimeout(() => this.setOnline(state), 1000);
        }
    }

    render() {
        if ( this.props.width > 0 && this.props.width <= 425 && !this.state.first) {
            this.setState({first: true});
            setTimeout(() => this.setState({show: true}), 500);
            setTimeout(() => this.setState({show: false}), 2500);
        }

        let render;
        let outClass = "";
        if ( !this.state.show ) {
            outClass = "offline-ui-bot-out";
        }
        if ( this.state.online ) {
            render = (
                <div className={"offline-ui-bot offline-ui-bot-up " + outClass}>
                    <div className="offline-ui-bot-content" data-retry-in-value="null" data-retry-in-unit="null"/>
                    <a href="" className="offline-ui-bot-retry"/>
                </div>
            );
        }
        else
        {
            render = (
                <div className={"offline-ui-bot offline-ui-bot-down " + outClass}>
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