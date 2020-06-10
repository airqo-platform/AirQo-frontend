import React from 'react';
/* eslint-disable */
import { IndexRoute } from 'react-router';
import { Switch, Redirect, Route } from 'react-router-dom';

import { RouteWithLayout } from '../components';
import { Main as MainLayout, Minimal as MinimalLayout } from '../layouts';
import PrivateRoute from '../views/components/PrivateRoute/PrivateRoute.js';
import Register from '../views/components/Users/RegisterAnalytics';

import {
  connectedUserList as ConnectedUserList,
  connectedCandidateList as ConnectedCandidateList,
  connectedSetDefaults as ConnectedSetDefaults
} from 'views/components/Users/containers/Users';

import {
  Dashboard as DashboardView,
  Graphs as GraphView,
  Reports as ReportView,
  Account as AccountView,
  Settings as SettingsView,
  NotFound as NotFoundView,
  Graphs,
  Download,
  ReportTemplate,
  LocationList as LocationListView,
  SignUp as SignUpView,
  Documentation,
} from '../views';

import Landing from '../views/layouts/Landing';
import ForgotPassword from '../views/components/Users/ForgotPassword';
import ResetPassword from '../views/components/Users/ResetPassword';
import Login from '../views/components/Users/Login';

const Routes = () => {
  return (
    <Switch>
      <Redirect exact from="/" to="/landing" />
      <PrivateRoute
        exact
        path="/dashboard"
        component={DashboardView}
        layout={MainLayout}
      />

      <PrivateRoute
        component={ConnectedUserList}
        exact
        layout={MainLayout}
        path="/admin/users"
      />

      <PrivateRoute
        component={ConnectedCandidateList}
        exact
        layout={MainLayout}
        path="/candidates"
      />

      <PrivateRoute
        component={Graphs}
        exact
        layout={MainLayout}
        path="/graphs"
      />
      <PrivateRoute
        component={ReportView}
        exact
        layout={MainLayout}
        path="/reports"
      />
      <PrivateRoute
        component={AccountView}
        exact
        layout={MainLayout}
        path="/account"
      />
      <PrivateRoute
        component={SettingsView}
        exact
        layout={MainLayout}
        path="/settings"
      />

    <PrivateRoute
            component={Download}
            exact
            layout={MainLayout}
            path="/download"
          />
      
      <PrivateRoute
        component={ReportTemplate}
        exact
        layout={MainLayout}
        path="/report"
      />

       <PrivateRoute
        component={ConnectedSetDefaults}
        exact
        layout={MainLayout}
        path="/defaults"
      />
      <PrivateRoute
        component={NotFoundView}
        exact
        layout={MinimalLayout}
        path="/not-found"
      />

      <PrivateRoute
        component={Graphs}
        exact
        layout={MainLayout}
        path="/location/:locationname"
      />

      <PrivateRoute
        component={LocationListView}
        exact
        layout={MainLayout}
        path="/locations"
      />

      <PrivateRoute
        component={Documentation}
        exact
        layout={MainLayout}
        path="/documentation"
      />

      <Route
        component={Landing}
        exact
        path="/landing"
      />
      <Route
        component={Login}
        exact
        path="/login"
      />
      <Route
        component={ForgotPassword}
        exact
        path="/forgot"
      />
      <RouteWithLayout
        component={ResetPassword}
        exact
        path="/reset"
      />
      <Route
        exact path="/forgot"
        component={ForgotPassword} />

<Route exact path="/register" component={Register} />
      
      <Route 
        exact path="/reset" 
        component={ResetPassword} />

      <RouteWithLayout
        component={SignUpView}
        exact
        layout={MinimalLayout}
        path="/sign-up"
      />
      
    
    <Route 
    exact path="/reset/:token" 
    component={ResetPassword} />

      <RouteWithLayout exact path="/reset" component={ResetPassword} />

      <Redirect to="/not-found" />
      
    </Switch>
  );
};

export default Routes;
