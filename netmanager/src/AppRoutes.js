import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import PrivateRoute from './views/components/PrivateRoute/PrivateRoute';
import { useInternetConnectivityCheck, useJiraHelpDesk } from 'utils/customHooks';

// core imports. imported on initial page load
import Overview from './views/components/Dashboard/Overview';
import Devices from './views/components/DataDisplay/Devices';
import { Main as MainLayout, Minimal as MinimalLayout } from 'views/layouts/';
import { NotFound as NotFoundView } from './views/pages/NotFound';
import { LargeCircularLoader } from 'views/components/Loader/CircularLoader';
import PermissionDenied from './views/pages/PermissionDenied';

// lazy imports
const Landing = lazy(() => import('./views/layouts/Landing'));
const Account = lazy(() => import('./views/pages/Account'));
const AnalyticsDashboard = lazy(() => import('./views/pages/Dashboard'));
const DeviceView = lazy(() => import('./views/components/DataDisplay/DeviceView'));
const ManagerMap = lazy(() =>
  import('./views/components/DataDisplay/DeviceManagement/ManagementMap')
);
const ManagerStats = lazy(() =>
  import('./views/components/DataDisplay/DeviceManagement/ManagementStats')
);
const Map = lazy(() => import('./views/components/Map'));
const OverlayMap = lazy(() => import('./views/pages/Map'));
const ForgotPassword = lazy(() => import('./views/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./views/pages/ResetPassword'));
const Login = lazy(() => import('./views/pages/SignUp/Login'));
const Register = lazy(() => import('./views/pages/SignUp/Register'));
const UserList = lazy(() => import('./views/pages/UserList'));
const AvailableUserList = lazy(() => import('./views/pages/UserList/AvailableUserList'));
const CandidateList = lazy(() => import('./views/pages/CandidateList'));
const Roles = lazy(() => import('./views/pages/Roles'));
const Settings = lazy(() => import('./views/pages/Settings'));
const SiteActivities = lazy(() => import('./views/components/Activities/ActivitiesRegistry'));
const SiteRegistry = lazy(() => import('./views/components/Sites/SiteRegistry'));
const SiteView = lazy(() => import('./views/components/Sites/SiteView'));
const AirQloudRegistry = lazy(() => import('./views/components/AirQlouds/AirQloudRegistry'));
const AirQloudView = lazy(() => import('./views/components/AirQlouds/AirQloudView'));
const Organisation = lazy(() => import('./views/pages/Organisation'));
const DataExportLogs = lazy(() => import('./views/pages/Logs/DataExport'));
const ExportDownloads = lazy(() => import('./views/pages/ExportData/downloads'));
const ExportData = lazy(() => import('./views/pages/ExportData'));

const AppRoutes = () => {
  useJiraHelpDesk();
  useInternetConnectivityCheck();
  return (
    <Router>
      <div className="App">
        <Suspense fallback={<LargeCircularLoader loading={true} height={'calc(100vh - 114px)'} />}>
          <Switch>
            <Route exact path="/" component={Landing} />
            <Route exact path="/login/:tenant?" component={Login} />
            <Route exact path="/forgot/:tenant?" component={ForgotPassword} />
            <Route exact path="/reset" component={ResetPassword} />
            <Route exact path="/request-access/:tenant?" component={Register} />
            <PrivateRoute
              exact
              path="/dashboard"
              component={AnalyticsDashboard}
              layout={MainLayout}
            />
            <PrivateRoute
              exact
              path="/admin/users/assigned-users"
              component={UserList}
              layout={MainLayout}
            />
            <PrivateRoute
              exact
              path="/admin/users/available-users"
              component={AvailableUserList}
              layout={MainLayout}
            />
            <PrivateRoute component={CandidateList} exact layout={MainLayout} path="/candidates" />
            <PrivateRoute component={Roles} exact layout={MainLayout} path="/roles" />
            <PrivateRoute component={Settings} exact layout={MainLayout} path="/settings" />
            <PrivateRoute component={Organisation} exact layout={MainLayout} path="/organisation" />

            <PrivateRoute path="/device/:deviceName" component={DeviceView} layout={MainLayout} />
            <PrivateRoute exact path="/locate" component={Map} layout={MainLayout} />
            <Route exact path="/map">
              <MainLayout>
                <OverlayMap />
              </MainLayout>
            </Route>
            <PrivateRoute component={Account} exact layout={MainLayout} path="/account" />
            <PrivateRoute exact path="/manager/map" component={ManagerMap} layout={MainLayout} />
            <PrivateRoute
              exact
              path="/manager/stats"
              component={ManagerStats}
              layout={MainLayout}
            />
            <PrivateRoute
              exact
              path="/manager/activities"
              component={SiteActivities}
              layout={MainLayout}
            />
            <PrivateRoute exact path="/sites" component={SiteRegistry} layout={MainLayout} />
            <PrivateRoute exact path="/sites/:id" component={SiteView} layout={MainLayout} />
            <PrivateRoute
              exact
              path="/airqlouds"
              component={AirQloudRegistry}
              layout={MainLayout}
            />
            <PrivateRoute
              exact
              path="/airqlouds/:id"
              component={AirQloudView}
              layout={MainLayout}
            />
            <PrivateRoute exact path="/overview" component={Overview} layout={MainLayout} />
            <PrivateRoute
              exact
              path="/export-data/options"
              component={ExportData}
              layout={MainLayout}
            />
            <PrivateRoute
              exact
              path="/export-data/scheduled"
              component={ExportDownloads}
              layout={MainLayout}
            />
            <PrivateRoute exact path="/registry" component={Devices} layout={MainLayout} />
            <PrivateRoute
              exact
              path="/logs/data-export"
              component={DataExportLogs}
              layout={MainLayout}
            />
            <PrivateRoute
              component={PermissionDenied}
              exact
              layout={MinimalLayout}
              path="/permission-denied"
            />
            <Route exact layout={MinimalLayout} path="*">
              <NotFoundView />
            </Route>
          </Switch>
        </Suspense>

        <div
          style={{
            position: 'fixed',
            bottom: 0,
            right: 0,
            marginRight: '10px',
            marginBottom: '20px'
          }}
        >
          <div id="jira-help-desk" />
        </div>
      </div>
    </Router>
  );
};

export default AppRoutes;
