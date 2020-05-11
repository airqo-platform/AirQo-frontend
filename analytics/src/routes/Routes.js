import React from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';

import { RouteWithLayout } from '../components';
import { Main as MainLayout, Minimal as MinimalLayout } from '../layouts';
import PrivateRoute from '../views/components/PrivateRoute/PrivateRoute.js';

import {
  Dashboard as DashboardView,
  Graphs as GraphView,
  UserList as UserListView,
  Reports as ReportView,
  Account as AccountView,
  Settings as SettingsView,
  NotFound as NotFoundView,
  Graphs,
  ReportTemplate as ReportTemplateView
} from '../views';

import Landing from '../views/layouts/Landing';
import ForgotPassword from '../views/components/input/ForgotPassword';
import ResetPassword from '../views/components/input/ResetPassword';
import Login from '../views/components/input/Login';

const Routes = () => {
  return (
    <Switch>
      <Redirect
        exact
        from="/"
        to="/login"
      />
      <PrivateRoute
        component={DashboardView}
        exact
        layout={MainLayout}
        path="/dashboard"
      />

      <PrivateRoute
        component={UserListView}
        exact
        layout={MainLayout}
        path="/admin/users"
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
      <RouteWithLayout
        component={ReportTemplateView}
        exact
        layout={MainLayout}
        path="/report_template"
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
        component={NotFoundView}
        exact
        layout={MinimalLayout}
        path="/not-found"
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
      <Redirect to="/not-found" />
    </Switch>
  );
};

export default Routes;
