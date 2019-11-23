import React from "react";
import ReactDOM from "react-dom";
import {
    BrowserRouter as Router,
    Switch
} from "react-router-dom";
import {Redirect} from "react-router-dom";
import {Route} from "react-router-dom";


import "./index.css";
import {NoMatch} from "./sites/errors";
import Login from "./sites/login/login";
import Masterpassword from "./sites/verify/masterpassword";
import 'bootstrap/dist/css/bootstrap.min.css';
// import * as serviceWorker from './service-worker/serviceWorker';
import {ProtectedRoute} from "./routing/ProtectedRoute"
import {createStore, applyMiddleware} from "redux";
import rootReducer from "./store/reducers/root.reducer";
import {Provider} from "react-redux"
import thunk from "redux-thunk";
import { Offline, Online, Detector } from "react-detect-offline";
import {handleConnection} from "./network/network.functions";
import Dashboard from "./sites/dashboard/dashboard";
import LoginAuth from "./authentification/auth.login"
import {swLogger} from "./service-worker/sw-handler";

// Load backend with WebAssembly
const worker = new Worker('worker.js');

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA


// serviceWorker.register();
/**
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('SW registered: ', registration);
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}*/

/**
const swStyle = [
    `background: salmon`,
    `border-radius: 0.5em`,
    `color: white`,
    `font-weight: bold`,
    `padding: 2px 0.5em`,
];

// When in a group, the workbox prefix is not displayed.
//const logPrefix = ['%cservice-worker', styles.join(';')];
console.log('%cservice-worker%cRegistered', swStyle.join(';'), '');*/



if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
    .then(function(registration) {
        swLogger('Registered', registration);
    })
    .catch(function(error) {
        swLogger('Registration failed', error);
    });
}


// Für Storage
const store = createStore(rootReducer, applyMiddleware(thunk));

// Grundapp
class App extends React.Component {

    constructor(state) {
        super(state);

        this.state = {
            isDisconnected: false
        };
    }

    componentDidMount() {
        this.handleConnectionChange();
        window.addEventListener('online', this.handleConnectionChange);
        window.addEventListener('offline', this.handleConnectionChange);
    }

    componentWillUnmount() {
        window.removeEventListener('online', this.handleConnectionChange);
        window.removeEventListener('offline', this.handleConnectionChange);
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
        if ( !this.state.isDisconnected )
        {
            return (
                <div className="App">
                    <Switch>
                        <Route exact path="/" component={Login} />
                        <ProtectedRoute exact path="/verify" component={Masterpassword} netState="online" type="auth" />
                        <ProtectedRoute exact path="/dashboard" component={Dashboard} netState="online" type="verify" />
                        <Route path="*" component={NoMatch} />
                    </Switch>
                </div>
            );
        }
        else
        {
            let redirect = <div/>;
            if (!LoginAuth.getLoggedIn())
            {
                redirect = <Redirect to="/verify"/>
            }
            console.log("Disconn: " + redirect);
            return (
                <div className="App">
                    {redirect}
                    <Switch>
                        <Route exact path="/verify" component={Masterpassword} />
                        <ProtectedRoute exact path="/dashboard" component={Dashboard} netState="offline" type="verify"/>
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
ReactDOM.render(<Provider store={store}><Router><App /></Router></Provider>, rootElement);
