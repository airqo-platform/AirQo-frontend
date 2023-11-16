import React, { Suspense, lazy, useState, useEffect } from 'react';
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
import { logoutUser } from './redux/Join/actions';
import { connect } from 'react-redux';
import ConfirmDialog from './views/containers/ConfirmDialog';

// lazy imports
const Landing = lazy(() => import('./views/layouts/Landing'));
const Account = lazy(() => import('./views/pages/Account'));
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
const Logs = lazy(() => import('./views/pages/Logs'));
const ExportDownloads = lazy(() => import('./views/pages/ExportData/downloads'));
const ExportData = lazy(() => import('./views/pages/ExportData'));
const Analytics = lazy(() => import('./views/pages/Analytics'));
const HostRegistry = lazy(() => import('./views/components/Hosts/HostRegistry'));
const HostView = lazy(() => import('./views/components/Hosts/HostView'));
const HeatMapOverlay = lazy(() => import('./views/pages/Heatmap/HeatMapOverlay'));
const CohortsRegistry = lazy(() => import('./views/pages/CohortsRegistry'));
const CohortDetails = lazy(() => import('./views/pages/CohortsRegistry/CohortDetails'));
const GridsRegistry = lazy(() => import('./views/pages/GridsRegistry'));
const GridsDetails = lazy(() => import('./views/pages/GridsRegistry/GridsDetails'));
const Teams = lazy(() => import('./views/pages/Teams/Teams'));
const TeamsView = lazy(() => import('./views/pages/Teams/TeamsView'));
const SimRegistry = lazy(() => import('./views/components/SIM/SimRegistry'));

const AppRoutes = ({ auth, logoutUser }) => {
  useJiraHelpDesk();
  useInternetConnectivityCheck();

  const sessionTimeoutInSeconds = 30;
  let inactivityTimer;

  const [sessionExpired, setSessionExpired] = useState(false);

  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      setSessionExpired(true);
      logoutUser();
    }, sessionTimeoutInSeconds * 60 * 1000);
  };

  const handleUserActivity = () => {
    resetInactivityTimer();
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
      resetInactivityTimer();
      window.addEventListener('mousemove', handleUserActivity);
      window.addEventListener('keypress', handleUserActivity);

      return () => {
        clearTimeout(inactivityTimer);
        window.removeEventListener('mousemove', handleUserActivity);
        window.removeEventListener('keypress', handleUserActivity);
      };
    }
  }, [auth.isAuthenticated]);

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
            <PrivateRoute exact path="/analytics" component={Analytics} layout={MainLayout} />
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
            <PrivateRoute component={Organisation} exact layout={MainLayout} path="/networks" />
            <PrivateRoute component={Teams} exact layout={MainLayout} path="/teams" />
            <PrivateRoute exact path="/teams/:id" component={TeamsView} layout={MainLayout} />

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
            <PrivateRoute exact path="/hosts" component={HostRegistry} layout={MainLayout} />
            <PrivateRoute exact path="/hosts/:id" component={HostView} layout={MainLayout} />
            <PrivateRoute exact path="/sites" component={SiteRegistry} layout={MainLayout} />
            <PrivateRoute exact path="/sites/:id" component={SiteView} layout={MainLayout} />
            <PrivateRoute exact path="/sim" component={SimRegistry} layout={MainLayout} />
            <PrivateRoute exact path="/heatMap" component={HeatMapOverlay} layout={MainLayout} />

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
            <PrivateRoute exact path="/logs" component={Logs} layout={MainLayout} />
            <PrivateRoute exact path="/cohorts" component={CohortsRegistry} layout={MainLayout} />
            <PrivateRoute
              exact
              path="/cohorts/:cohortName"
              component={CohortDetails}
              layout={MainLayout}
            />
            <PrivateRoute exact path="/grids" component={GridsRegistry} layout={MainLayout} />
            <PrivateRoute
              exact
              path="/grids/:gridName"
              component={GridsDetails}
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

        {sessionExpired && (
          <ConfirmDialog
            open={sessionExpired}
            close={() => window.location.replace('/')}
            title="Session Expired"
            message="Your session has expired due to inactivity. Please log in again."
            confirmBtnMsg="Log In"
            confirm={() => setSessionExpired(false)}
            error={false}
          />
        )}
      </div>
    </Router>
  );
};
const mapStateToProps = (state) => ({
  auth: state.auth
});

export default connect(mapStateToProps, { logoutUser })(AppRoutes);
