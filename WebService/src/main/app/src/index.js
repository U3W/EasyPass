import React from "react";
import ReactDOM from "react-dom";
import {
    Router,
    Switch,
    Redirect,
    Route
} from "react-router-dom";

import history from './routing/history';

import "./index.css";
import "../src/sites/all.css"
import {NoMatch} from "./sites/errors";
import Login from "./sites/login/login";
import 'bootstrap/dist/css/bootstrap.min.css';
import {ProtectedRoute} from "./routing/ProtectedRoute"
import {createStore, applyMiddleware} from "redux";
import rootReducer from "./store/reducers/root.reducer";
import {Provider} from "react-redux"
import thunk from "redux-thunk";
import Dashboard from "./sites/dashboard/dashboard";
import * as serviceWorker from "./service-worker/sw-handler";


import Logo from './img/logo/Logo_Single_Big.svg'
import Cloud1 from './img/logo/Cloud1.svg'
import Cloud2 from './img/logo/Cloud2.svg'
import Cloud3 from './img/logo/Cloud3.svg'
import Cloud4 from './img/logo/Cloud4.svg'
import {
    bounceInDown,
    bounceOutDown,
    fadeOut,
    fadeIn,
    fadeInLeft,
    fadeInRight,
    fadeOutLeft,
    fadeOutRight,
} from 'react-animations';

import Radium, {StyleRoot} from 'radium';
import dashboardState from "./sites/dashboard/dashboard.saved.state";
import indexState from "./index.saved.state";

// IndicatorEnum
export const IndicatorEnum = {
    Main: "Main",
    Side: "Side",
    Bot: "Bot",
};


// Load service worker
serviceWorker.register();

// For Storage
const store = createStore(rootReducer, applyMiddleware(thunk));

// For the animation
const styles = {
    logo: {
        animation: 'x 1s',
        animationName: Radium.keyframes(bounceInDown, 'bounceInDown')
    },
    logoOut: {
        animation: 'x 0.7s',
        animationName: Radium.keyframes(bounceOutDown, 'bounceOutDown')
    },
    cloudsOut: {
        animation: 'x 0.7s',
        animationName: Radium.keyframes(fadeOut, 'fadeOut')
    },
    cloudsIn: {
        animation: 'x 1.2s',
        animationName: Radium.keyframes(fadeIn, 'fadeIn')
    },
    cloud1LeftIn: {
        animation: 'x 1s',
        animationName: Radium.keyframes(fadeInLeft, 'fadeInLeft')
    },
    cloud1RightOut: {
        animation: 'x 1s',
        animationName: Radium.keyframes(fadeOutRight, 'fadeOutRight')
    },
    cloud3LeftIn: {
        animation: 'x 1.2s',
        animationName: Radium.keyframes(fadeInLeft, 'fadeInLeft')
    },
    cloud4LeftIn: {
        animation: 'x 1.05s',
        animationName: Radium.keyframes(fadeInLeft, 'fadeInLeft')
    },
    cloud4RightOut: {
        animation: 'x 1s',
        animationName: Radium.keyframes(fadeOutRight, 'fadeOutRight')
    },
    cloud3RightOut: {
        animation: 'x 0.7s',
        animationName: Radium.keyframes(fadeOutRight, 'fadeOutRight')
    },
    cloud2RightIn: {
        animation: 'x 1s',
        animationName: Radium.keyframes(fadeInRight, 'fadeInRight')
    },
    cloud2LeftOut: {
        animation: 'x 1s',
        animationName: Radium.keyframes(fadeOutLeft, 'fadeOutLeft')
    },
    cloud5RightIn: {
        animation: 'x 1s',
        animationName: Radium.keyframes(fadeInRight, 'fadeInRight')
    },
    cloud5LeftOut: {
        animation: 'x 1s',
        animationName: Radium.keyframes(fadeOutLeft, 'fadeOutLeft')
    }
};

// Baseapp
class App extends React.Component {

    constructor(state) {
        super(state);



        this.state = {
            currLoginAnimation: 0,
            animationFinished: false,
            startAnimation: false,
            isDisconnected: false,
            // Load backend with WebAssembly
            worker: new Worker('worker.js'),
            workerInitialized: false,
        };

        this.workerInit = this.workerInit.bind(this);


        this.ref = React.createRef();
    }

    componentDidMount() {
        // Add listener for Worker
        if (!this.state.workerInitialized) {
            this.state.worker.addEventListener("message", this.workerInit);
            indexState.setLoadingState(true);
        }


        // TODO Fix HandleConnection
        //  Function makes always a re-render, even though the state has not changed
        //  This results in flickering of data in the dashboard!!
        this.handleConnectionChange();
        window.addEventListener('online', this.handleConnectionChange);
        window.addEventListener('offline', this.handleConnectionChange);
    }

    componentWillUnmount() {
        // Remove Worker listener
        this.state.worker.postMessage(['unregister', undefined]);
        if (!this.state.workerInitialized) {
            this.state.worker.removeEventListener("message", this.workerInit);
            indexState.setLoadingState(true);
        }

        window.removeEventListener('online', this.handleConnectionChange);
        window.removeEventListener('offline', this.handleConnectionChange);
    }

    workerInit( e ) {
        const success = e.data === 'initDone';
        if (success) {
            this.state.worker.removeEventListener("message", this.workerInit);
            this.state.worker.postMessage('initAck');
            this.setState({
                workerInitialized: true,
            }, () => {
                // save to localstorage
                setTimeout(() => {
                    indexState.setLoadingState(false);
                }, 2500);
                setTimeout(() => {
                    this.setState({
                        currentLogoAnimation: 1,
                    }, () => {
                        setTimeout(() => {
                            this.setState({
                                animationFinished: true,
                            });
                        }, 650);

                    })
                }, 1500);
            });
        }
    }

    handleConnectionChange = () => {
        const condition = navigator.onLine ? 'online' : 'offline';
        let isConn = false;
        if (condition === 'online') {
            console.log("Online");
            isConn = true;
            const webPing = setInterval(
                () => {
                    fetch('//google.com', {
                        mode: 'no-cors',
                    })
                        .then(() => {
                            isConn = true;
                            this.setState({ isDisconnected: false }, () => {
                                return clearInterval(webPing)
                            });
                        }).catch(() => {this.setState({ isDisconnected: true }); isConn = false; console.log("Offline")})
                }, 500);
            return;
        }

        // ToDO @Kacper worker call with this.state.isDisconnected
        this.ref.current.setOnline(this.state.isDisconnected);
    };


    getApp() {
        console.log("Worker state: " + this.state.workerInitialized);
        console.log("Disconnected: " + this.state.isDisconnected);

        if ( this.state.animationFinished ) {
            return (
                <div className="App">
                    <Switch>
                        <Route exact path="/" component={() => <Login worker={this.state.worker} callback={this}/>}/>
                        {/*<ProtectedRoute exact path="/dashboard" component={() =>
                            <Dashboard worker={this.state.worker} workerInitialized={this.state.workerInitialized}
                                workerIsInitialized={this.workerIsInitialized}/>}
                                netState="online" type="verify" />*/}
                        {/*<ProtectedRoute exact path="/dashboard" render={() =>
                            <h1>Hey</h1>}/>*/}
                        <ProtectedRoute exact path="/dashboard" component={() =>
                            <Dashboard worker={this.state.worker} callback={this} />} type="auth"/>
                        <Route path="*" component={NoMatch}/>
                    </Switch>
                </div>
            );
        } else {
            let styleType = styles.logo;
            let styleCloud1 = styles.cloud1LeftIn;
            let styleCloud2 = styles.cloud2RightIn;
            let styleCloud3 = styles.cloud3LeftIn;
            let styleCloud4 = styles.cloud4LeftIn;
            let styleCloud5 = styles.cloud5RightIn;
            if ( this.state.currentLogoAnimation === 1 ) {
                styleType = styles.logoOut;
                styleCloud1 = styles.cloud1RightOut;
                styleCloud2 = styles.cloud2LeftOut;
                styleCloud3 = styles.cloud3RightOut;
                styleCloud4 = styles.cloud4RightOut;
                styleCloud5 = styles.cloud5LeftOut;
            }
            return (
                <div className="fixHeight">
                    <StyleRoot className="topPositioning">
                        <div style={styleType} className="test" >
                            <img
                                src={Logo}
                                alt=""
                                className="logoAnm"
                            />
                        </div>
                    </StyleRoot>
                    <StyleRoot className="leftPositioning topPositioning">
                        <div style={styleCloud1}>
                            <img
                                src={Cloud1}
                                alt=""
                                className="cloud1"
                            />
                        </div>
                    </StyleRoot>
                    <StyleRoot className="rightPositioning topPositioning">
                        <div style={styleCloud2}>
                            <img
                                src={Cloud2}
                                alt=""
                                className="cloud2"
                            />
                        </div>
                    </StyleRoot>
                    <StyleRoot className="leftPositioning topPositioning onTop">
                        <div style={styleCloud3}>
                            <img
                                src={Cloud3}
                                alt=""
                                className="cloud3"
                            />
                        </div>
                    </StyleRoot>
                    <StyleRoot className="rightPositioning topPositioning">
                        <div style={styleCloud5}>
                            <img
                                src={Cloud2}
                                alt=""
                                className="cloud5"
                            />
                        </div>
                    </StyleRoot>
                    <StyleRoot className="leftPositioning topPositioning">
                        <div style={styleCloud4}>
                            <img
                                src={Cloud4}
                                alt=""
                                className="cloud4"
                            />
                        </div>
                    </StyleRoot>
                </div>
            )
        }

    }

    render() {
        return this.getApp();
    }
}

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}
// Ins Grundgerüst setzen
const rootElement = document.getElementById("root");
ReactDOM.render(<Provider store={store}><Router history={history}><App/></Router></Provider>, rootElement);
