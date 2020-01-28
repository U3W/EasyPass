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
import {NoMatch} from "./sites/errors";
import Login from "./sites/login/login";
import Masterpassword from "./sites/verify/masterpassword";
import Registration from "./sites/registration/registration";
import 'bootstrap/dist/css/bootstrap.min.css';
import {ProtectedRoute} from "./routing/ProtectedRoute"
import {createStore, applyMiddleware} from "redux";
import rootReducer from "./store/reducers/root.reducer";
import {Provider} from "react-redux"
import thunk from "redux-thunk";
import Dashboard from "./sites/dashboard/dashboard";
import * as serviceWorker from "./service-worker/sw-handler";
import * as that from "./sites/dashboard/dashboard.extended";


import { ReactComponent as LogoComp } from './img/logo/Logo_Single_Big.svg';
import Logo from './img/logo/Logo_Single_Big.svg'
import { bounce } from 'react-animations';
import { bounceInDown } from 'react-animations';
import { bounceOutDown } from 'react-animations';

import Radium, {StyleRoot} from 'radium';



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
        animation: 'x 1s',
        animationName: Radium.keyframes(bounceOutDown, 'bounceOutDown')
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
            workerInitialized: false
        };

        this.workerInit = this.workerInit.bind(this);
    }

    componentDidMount() {
        // Add listener for Worker
        if (!this.state.workerInitialized) {
            this.state.worker.addEventListener("message", this.workerInit);
        }


        // TODO Fix HandleConnection
        //  Function makes always a re-render, even though the state has not changed
        //  This results in flickering of data in the dashboard!!
        // this.handleConnectionChange();
        // window.addEventListener('online', this.handleConnectionChange);
        // window.addEventListener('offline', this.handleConnectionChange);
    }

    componentWillUnmount() {
        // Remove Worker listener
        this.state.worker.postMessage(['unregister', undefined]);
        if (!this.state.workerInitialized)
            this.state.worker.removeEventListener("message", this.workerInit);

        // window.removeEventListener('online', this.handleConnectionChange);
        // window.removeEventListener('offline', this.handleConnectionChange);
    }

    workerInit( e ) {
        const success = e.data === 'initDone';
        if (success) {
            this.state.worker.removeEventListener("message", this.workerInit);
            this.state.worker.postMessage('initAck');
            this.setState({
                workerInitialized: true,
            }, () => {
                console.log("Test");
                setTimeout(() => {
                    this.setState({
                        currentLogoAnimation: 1,
                    }, () => {
                        setTimeout(() => {
                            this.setState({
                                animationFinished: true,
                            });
                        }, 1000);

                    })
                }, 2000);
            });
        }
    }

    handleConnectionChange = () => {
        const condition = navigator.onLine ? 'online' : 'offline';
        if (condition === 'online') {
            const webPing = setInterval(
                () => {
                    fetch('//google.com', {
                        mode: 'no-cors',
                    })
                        .then(() => {
                            this.setState({ isDisconnected: false }, () => {
                                return clearInterval(webPing)
                            });
                        }).catch(() => this.setState({ isDisconnected: true }) )
                }, 1000);
            return;
        }

        return this.setState({ isDisconnected: true });
    };

    getApp() {
        console.log("Worker state: " + this.state.workerInitialized);
        console.log("Disconnected: " + this.state.isDisconnected);

        if ( this.state.animationFinished ) {
            return (
                <div className="App">
                    <Switch>
                        <Route exact path="/" component={() => <Login worker={this.state.worker}/>}/>
                        <Route exact path="/registration"
                               component={() => <Registration worker={this.state.worker}/>}/>
                        <ProtectedRoute exact path="/verify" component={() =>
                            <Masterpassword worker={this.state.worker} />} netState="online" type="auth"/>
                        {/*<ProtectedRoute exact path="/dashboard" component={() =>
                            <Dashboard worker={this.state.worker} workerInitialized={this.state.workerInitialized}
                                workerIsInitialized={this.workerIsInitialized}/>}
                                netState="online" type="verify" />*/}
                        {/*<ProtectedRoute exact path="/dashboard" render={() =>
                            <h1>Hey</h1>}/>*/}
                        <ProtectedRoute exact path="/dashboard" component={() =>
                            <Dashboard worker={this.state.worker} />} netState="online" type="verify"/>
                        <Route path="*" component={NoMatch}/>
                    </Switch>
                </div>
            );
            /*
            if (!this.state.isDisconnected) {

            } else {
                let redirect = <div/>;
                if (VerifyAuth.getVerified()) {
                    redirect = <Redirect to="/dashboard"/>
                } else {
                    redirect = <Redirect to="/verify"/>
                }
                //console.log("Disconn: " + redirect);
                return (
                    <div className="App">
                        {redirect}
                        <Switch>
                            <Route exact path="/verify" component={() => <Masterpassword worker={this.state.worker}/>}/>
                            <ProtectedRoute exact path="/dashboard"
                                            component={() => <Dashboard worker={this.state.worker}/>} netState="offline"
                                            type="verify"/>
                            <Route path="*" component={NoMatch}/>
                        </Switch>
                    </div>
                );
            }*/
        } else {
            // TODO @Seb Please make a cool loading page!
            let styleType = styles.logo;
            if ( this.state.currentLogoAnimation === 1 ) {
                styleType = styles.logoOut;
            }
            console.log("Curr", this.state.currentLogoAnimation);
            return (
                <StyleRoot className="fixHeight">
                    <div style={styleType}>
                        <img
                            src={Logo}
                            alt=""
                            className="d-inline-block"
                        />
                    </div>
                </StyleRoot>
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
ReactDOM.render(<Provider store={store}><Router history={history}><App /></Router></Provider>, rootElement);
