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
import { Offline, Online, Detector } from "react-detect-offline";
import {handleConnection} from "./network/network.functions";
import Dashboard from "./sites/dashboard/dashboard";
import VerifyAuth from "./authentification/auth.masterpassword"
import * as serviceWorker from "./service-worker/sw-handler";



// Load service worker
serviceWorker.register();

// Für Storage
const store = createStore(rootReducer, applyMiddleware(thunk));

// Grundapp
class App extends React.Component {

    constructor(state) {
        super(state);

        this.state = {
            isDisconnected: false,
            // Load backend with WebAssembly
            worker: new Worker('worker.js'),
            workerInitialized: false
        };
        this.workerIsInitialized = this.workerIsInitialized.bind(this);
    }

    componentDidMount() {
        // TODO Fix HandleConnection
        //  Function makes always a re-render, even though the state has not changed
        //  This results in flickering of data in the dashboard!!
        //this.handleConnectionChange();
        window.addEventListener('online', this.handleConnectionChange);
        window.addEventListener('offline', this.handleConnectionChange);
    }

    componentWillUnmount() {
        window.removeEventListener('online', this.handleConnectionChange);
        window.removeEventListener('offline', this.handleConnectionChange);
    }

    workerIsInitialized() {
        /*
        // Triggers unnecessary re-render
        this.setState({
            workerInitialized: true
        });
        */
        // TODO @Seb Set workerInitalized without re-rendering?
        //  This line violates React rules but kinda works...
        this.state.workerInitialized = true;
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
                }, 2000);
            return;
        }

        return this.setState({ isDisconnected: true });
    };

    getApp() {
        console.log("Worker state: " + this.state.workerInitialized);
        console.log("Disconnected: " + this.state.isDisconnected);
        if ( !this.state.isDisconnected )
        {
            return (
                <div className="App">
                    <Switch>
                        <Route exact path="/" component={() => <Login worker={this.state.worker} />} />
                        <Route exact path="/registration" component={() => <Registration worker={this.state.worker} />}/>
                        <ProtectedRoute exact path="/verify" component={() =>
                            <Masterpassword worker={this.state.worker} workerInitialized={this.state.workerInitialized}
                                workerIsInitialized={this.workerIsInitialized}/>}
                                netState="online" type="auth" />
                        {/*<ProtectedRoute exact path="/dashboard" component={() =>
                            <Dashboard worker={this.state.worker} workerInitialized={this.state.workerInitialized}
                                workerIsInitialized={this.workerIsInitialized}/>}
                                netState="online" type="verify" />*/}
                        {/*<ProtectedRoute exact path="/dashboard" render={() =>
                            <h1>Hey</h1>}/>*/}
                        <ProtectedRoute exact path="/dashboard" component={() =>
                        <Dashboard worker={this.state.worker} workerInitialized={this.state.workerInitialized}
                                   workerIsInitialized={this.workerIsInitialized}/>}
                                         netState="online" type="verify" />
                        <Route path="*" component={NoMatch} />
                    </Switch>
                </div>
            );
        }
        else
        {
            let redirect = <div/>;
            if (VerifyAuth.getVerified())
            {
                redirect = <Redirect to="/dashboard"/>
            }
            else {
                redirect = <Redirect to="/verify"/>
            }
            //console.log("Disconn: " + redirect);
            return (
                <div className="App">
                    {redirect}
                    <Switch>
                        <Route exact path="/verify" component={() => <Masterpassword worker={this.state.worker} />} />
                        <ProtectedRoute exact path="/dashboard" component={() => <Dashboard worker={this.state.worker}/>} netState="offline" type="verify"/>
                        <Route path="*" component={NoMatch} />
                    </Switch>
                </div>
            );
        }

    }

    render() {
        return this.getApp();
    }
}
// Ins Grundgerüst setzen
const rootElement = document.getElementById("root");
ReactDOM.render(<Provider store={store}><Router history={history}><App /></Router></Provider>, rootElement);
