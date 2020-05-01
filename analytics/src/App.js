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

import Login from "./views/components/input/Login";
import PrivateRoute from "./views/components/PrivateRoute/PrivateRoute";

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

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Router history={browserHistory}>
        <div className="App">
          <Routes />
          </div>
        </Router>
      </ThemeProvider>
      </Provider>
    );
  }
}
