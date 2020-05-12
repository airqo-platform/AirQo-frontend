import React, { Component } from 'react';
import "./App.css";
import {
    BrowserRouter as Router,
    Route,
    Switch,
    Redirect,
} from "react-router-dom";
import jwt_decode from "jwt-decode";
import setAuthToken from "./utils/setAuthToken";
import { setCurrentUser, logoutUser } from "./redux/Join/actions";
import { Provider } from "react-redux"
import store from "./store";


import { createBrowserHistory } from 'history';
import { Chart } from 'react-chartjs-2';
import { ThemeProvider } from '@material-ui/styles';
import validate from 'validate.js';

import { chartjs } from './helpers';
import theme from './theme';
import 'react-perfect-scrollbar/dist/css/styles.css';
import './assets/scss/index.scss';
import validators from './common/validators';
import Routes from './routes/Routes';
import IdleTimer from 'react-idle-timer'
import Login from "./views/components/Users/Login";
import PrivateRoute from "./views/components/PrivateRoute/PrivateRoute";
import { connect } from "react-redux";

const browserHistory = createBrowserHistory();

Chart.helpers.extend(Chart.elements.Rectangle.prototype, {
    draw: chartjs.draw
});

validate.validators = {
    ...validate.validators,
    ...validators
};

// Check for token to keep user logged in
if (localStorage.jwtToken) {
    // Set auth token header auth
    const token = localStorage.jwtToken;
    setAuthToken(token);
    // Decode token and get user info and exp
    const decoded = jwt_decode(token);
    // Set user and isAuthenticated
    store.dispatch(setCurrentUser(decoded));
    // Check for expired token
    const currentTime = Date.now() / 1000; // to get in milliseconds
    if (decoded.exp < currentTime) {
        // Logout user
        store.dispatch(logoutUser());
        // Redirect to login
        window.location.href = "./login";
    }
}

class App extends Component {

    constructor(props){
super(props)
this.idleTimer=null;
this.onAction = this._onAction.bind(this);
this.onActive = this._onActive.bind(this);
this.onIdle = this._onIdle.bind(this);
     }

    render() {
        return (
            <Provider store={store}>
                <ThemeProvider theme={theme}>
                    <Router history={browserHistory}>
                        <div className="App">
                        <IdleTimer
          ref={ref => { this.idleTimer = ref }}
          element={document}
          onActive={this.onActive}
          onIdle={this.onIdle}
          onAction={this.onAction}
          debounce={250}
          timeout={1000 * 60 * 15} />
                            <Routes />
                        </div>
                    </Router>
                </ThemeProvider>
            </Provider>
        );
    }

_inAction(e) {
    console.log('user did something', e);
}
_onActive(e){
    console.log('user is active', e)
    console.log('time remaining', this.idleTimer.getRemainingTime());
}

_onIdle(e){
    console.log('user is idle', e)
    console.log('last active', this.idleTimer.getLastActiveTime());
    if (this.idleTimer.getRemainingTime == 0){
        this.props.logoutUser();
    }
    /***
     * basing on the value the remaining time, I can get to logout the individual like a real boss
     */
}
}

//let me first map the states to the props
const mapStateToProps = (state) => ({
    auth: state.auth,
  });

export default connect(mapStateToProps, { logoutUser })(App);