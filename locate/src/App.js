import React, { Component } from "react";
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

import { Provider } from "react-redux";
import store from "./store";
import { ThemeProvider } from "@material-ui/styles";
import theme from "./assets/theme";

import Navbar from "./views/components/Navbars/Navbar";
import Landing from "./views/layouts/Landing";
import Admin from "./views/layouts/Admin";
import Register from "./views/components/auth/Register";
import ForgotPassword from "./views/components/auth/ForgotPassword";
import ResetPassword from "./views/components/auth/ResetPassword";
import {
  Main as MainLayout,
  Maps as MapLayout,
  Minimal as MinimalLayout,
} from "../src/views/layouts/";
import Login from "./views/components/auth/Login";
import PrivateRoute from "./views/components/PrivateRoute/PrivateRoute";
import Dashboard from "./views/components/Dashboard/Dashboard";
import Map from "./views/components/Map/Map";

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
  render() {
    return (
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <Router>
            <div className="App">
              <Navbar />
              <Route exact path="/" component={Landing} />
              <Route exact path="/register" component={Register} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/forgot" component={ForgotPassword} />
              <Route exact path="/reset" component={ResetPassword} />
              <Switch>
                <PrivateRoute
                  exact
                  path="/dashboard"
                  component={Dashboard}
                  layout={MainLayout}
                />
                <PrivateRoute
                  exact
                  path="/locate"
                  component={Map}
                  layout={MapLayout}
                />
              </Switch>
            </div>
          </Router>
        </ThemeProvider>
      </Provider>
    );
  }
}
export default App;
