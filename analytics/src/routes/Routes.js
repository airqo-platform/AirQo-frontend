import React from 'react';
import { Switch, Redirect } from 'react-router-dom';

import { RouteWithLayout } from '../components';
import { Main as MainLayout, Minimal as MinimalLayout} from '../layouts';

import {
  Dashboard as DashboardView,
  Graphs as GraphView,
  UserList as UserListView,
  Reports as ReportView,
  Account as AccountView,
  Settings as SettingsView,
  NotFound as NotFoundView,
  Graphs
} from '../views';

const Routes = () => {
  return (
    <Switch>
      <Redirect
        exact
        from="/"
        to="/dashboard"
      />
      <RouteWithLayout
        component={DashboardView}
        exact
        layout={MainLayout}
        path="/dashboard"
      />
      <RouteWithLayout
        component={UserListView}
        exact
        layout={MainLayout}
        path="/admin/users"
      />
      <RouteWithLayout
        component={Graphs}
        exact
        layout={MainLayout}
        path="/graphs"
      />
      <RouteWithLayout
        component={ReportView}
        exact
        layout={MainLayout}
        path="/reports"
      />
      <RouteWithLayout
        component={AccountView}
        exact
        layout={MainLayout}
        path="/account"
      />
      <RouteWithLayout
        component={SettingsView}
        exact
        layout={MainLayout}
        path="/settings"
      />
      <RouteWithLayout
        component={NotFoundView}
        exact
        layout={MinimalLayout}
        path="/not-found"
      />
      <Redirect to="/not-found" />
    </Switch>
  );
};

export default Routes;
