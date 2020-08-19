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
import Register from "./views/components/Inputs/Register";
import ForgotPassword from "./views/components/Inputs/ForgotPassword";
import ResetPassword from "./views/components/Inputs/ResetPassword";
import RegisterAnalytics from "./views/components/Inputs/RegisterAnalytics";
import {
  Main as MainLayout,
  Maps as MapLayout,
  Minimal as MinimalLayout,
} from "../src/views/layouts/";
import Login from "./views/components/Inputs/Login";
import Profile from "./views/components/Inputs/UserProfile";
import Settings from "./views/components/Inputs/Settings";
import PrivateRoute from "./views/components/PrivateRoute/PrivateRoute";
import Dashboard from "./views/components/Dashboard/Dashboard";
import Map from "./views/components/Map";
import Devices from "./views/components/DataDisplay/Devices";
import DeviceView from "./views/components/DataDisplay/DeviceView";
import Users from "./views/components/DataDisplay/Users";
import Manager from "./views/components/DataDisplay/DeviceManagement";
import Incentives from "./views/components/DataDisplay/Incentives";
import {
  LocationList,
  LocationRegister,
  LocationView,
  LocationEdit,
} from "./views/components/LocationList";
//import { LocationRegister }from "./views/components/LocationRegister";
//import { LocationRegister } from "./views/components/LocationList/LocationRegister";

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
              <Route exact path="/" component={Login} />
              <Route exact path="/register" component={Register} />
              {/* <Route exact path="/login" component={Login} /> */}
              <Route exact path="/forgot" component={ForgotPassword} />
              <Route exact path="/reset/:token" component={ResetPassword} />
              <Route exact path="/analytics" component={RegisterAnalytics} />
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
                  layout={MainLayout}
                />
                <PrivateRoute
                  extact
                  path="/registry"
                  component={Devices}
                  layout={MainLayout}
                />
                <PrivateRoute
                  exact
                  path="/device/:channelId"
                  component={DeviceView}
                  layout={MainLayout}
                />
                <PrivateRoute
                  extact
                  path="/location"
                  component={LocationList}
                  layout={MainLayout}
                />
                <PrivateRoute
                  extact
                  path="/register_location"
                  component={LocationRegister}
                  layout={MainLayout}
                />
                <PrivateRoute
                  exact
                  path="/edit/:loc_ref"
                  component={LocationEdit}
                  layout={MainLayout}
                />
                <PrivateRoute
                  exact
                  path="/locations/:loc_ref"
                  component={LocationView}
                  layout={MainLayout}
                />
                <PrivateRoute
                  exact
                  path="/admin/users"
                  component={Users}
                  layout={MainLayout}
                />
                <PrivateRoute
                  exact
                  path="/account"
                  component={Profile}
                  layout={MainLayout}
                />

                <PrivateRoute
                  exact
                  path="/settings"
                  component={Settings}
                  layout={MainLayout}
                />

                <PrivateRoute
                  exact
                  path="/manager"
                  component={Manager}
                  layout={MainLayout}
                />

                <PrivateRoute
                  exact
                  path="/incentives"
                  component={Incentives}
                  layout={MainLayout}
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
