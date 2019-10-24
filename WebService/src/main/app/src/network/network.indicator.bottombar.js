import "./network.indicator.bottombar.css"
import React from "react"
import {Online, Offline} from "react-detect-offline";
class IndicatorBot extends React.Component {
    render() {
        return (
            <div className="bottom">
                <Offline>
                    <div className="offline-ui-bot    offline-ui-bot-down ">
                        <div className="offline-ui-bot-content" data-retry-in-value="null" data-retry-in-unit="null"/>
                        <a href="" className="offline-ui-bot-retry"/>
                    </div>
                </Offline>
                <Online>
                    <div className="offline-ui-bot    offline-ui-bot-up ">
                        <div className="offline-ui-bot-content" data-retry-in-value="null" data-retry-in-unit="null"/>
                        <a href="" className="offline-ui-bot-retry"/>
                    </div>
                </Online>
            </div>
        );
    }
}

export default IndicatorBot;