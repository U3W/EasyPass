import "./network.indicator.css"
import React from "react"
import {Online, Offline} from "react-detect-offline";
class Indicator extends React.Component {
    render() {
        return (
            <div>
                <Offline>
                    <div className="offline-ui    offline-ui-down ">
                        <div className="offline-ui-content" data-retry-in-value="null" data-retry-in-unit="null"/>
                        <a href="" className="offline-ui-retry"/>
                    </div>
                </Offline>
                <Online>
                    <div className="offline-ui    offline-ui-up ">
                        <div className="offline-ui-content" data-retry-in-value="null" data-retry-in-unit="null"/>
                        <a href="" className="offline-ui-retry"/>
                    </div>
                </Online>
            </div>
        );
    }
}

export default Indicator;