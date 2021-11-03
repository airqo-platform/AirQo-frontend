import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import PrivateRoute from "./views/components/PrivateRoute/PrivateRoute";
import { useInternetConnectivityCheck, useJiraHelpDesk } from "utils/customHooks";

// core imports. imported on initial page load
import Overview from "./views/components/Dashboard/Overview";
import Devices from "./views/components/DataDisplay/Devices";
import { Download as DownloadView } from "./views/pages/Download";
import Landing from "./views/layouts/Landing";
import { Main as MainLayout, Minimal as MinimalLayout } from "views/layouts/";
import { NotFound as NotFoundView } from "./views/pages/NotFound";
import { LargeCircularLoader } from "views/components/Loader/CircularLoader";

// lazy imports
const Account = lazy(() => import("./views/pages/Account"));
const AnalyticsDashboard = lazy(() => import("./views/pages/Dashboard"));
const DeviceView = lazy(() => import("./views/components/DataDisplay/DeviceView"));
const Manager = lazy(() => import("./views/components/DataDisplay/DeviceManagement"));
const Map = lazy(() => import("./views/components/Map"));
const OverlayMap = lazy(() => import("./views/pages/Map"));
const ForgotPassword = lazy(() => import("./views/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./views/pages/ResetPassword"));
const Login = lazy(() => import("./views/pages/SignUp/Login"));
const Register = lazy(() => import("./views/pages/SignUp/Register"));
const UserList = lazy(() => import("./views/pages/UserList"));
const CandidateList = lazy(() => import("./views/pages/CandidateList"));
const Settings = lazy(() => import("./views/pages/Settings"));
const SiteRegistry = lazy(() => import("./views/components/Sites/SiteRegistry"));
const SiteView = lazy(() => import("./views/components/Sites/SiteView"));
const Reports = lazy(() => import("./views/pages/Reports/Reports"));
const AddReport = lazy(() => import("./views/pages/Reports/AddReport"));
const ViewReport = lazy(() => import("./views/pages/Reports/ViewReport"));

const AppRoutes = () => {
  useJiraHelpDesk();
  useInternetConnectivityCheck();
  return (
    <Router>
      <div className="App">
        <Route exact path="/" component={Landing} />

        <Suspense fallback={<LargeCircularLoader loading={true} />}>
          <Route exact path="/login/:tenant?" component={Login} />
          <Route exact path="/forgot/:tenant?" component={ForgotPassword} />
          <Route exact path="/reset" component={ResetPassword} />
          <Route exact path="/request-access/:tenant?" component={Register} />
        </Suspense>
        <Suspense
          fallback={
            <MainLayout>
              <LargeCircularLoader
                loading={true}
                height={"calc(100vh - 114px)"}
              />
            </MainLayout>
          }
        >
          <PrivateRoute
            exact
            path="/dashboard"
            component={AnalyticsDashboard}
            layout={MainLayout}
          />
          <PrivateRoute
            exact
            path="/admin/users"
            component={UserList}
            layout={MainLayout}
          />
          <PrivateRoute
            component={CandidateList}
            exact
            layout={MainLayout}
            path="/candidates"
          />
          <PrivateRoute
            component={Settings}
            exact
            layout={MainLayout}
            path="/settings"
          />

          <PrivateRoute
            path="/device/:deviceName"
            component={DeviceView}
            layout={MainLayout}
          />
          <PrivateRoute
            exact
            path="/locate"
            component={Map}
            layout={MainLayout}
          />
          <PrivateRoute
            exact
            path="/map"
            component={OverlayMap}
            layout={MainLayout}
          />
          <PrivateRoute
            component={Account}
            exact
            layout={MainLayout}
            path="/account"
          />
          <PrivateRoute
            exact
            path="/manager"
            component={Manager}
            layout={MainLayout}
          />
          <PrivateRoute
            exact
            path="/sites"
            component={SiteRegistry}
            layout={MainLayout}
          />
          <PrivateRoute
            exact
            path="/sites/:id"
            component={SiteView}
            layout={MainLayout}
          />
          <PrivateRoute
            exact
            path="/reports"
            component={Reports}
            layout={MainLayout}
          />
          <PrivateRoute
            exact
            path="/reports/new-report"
            component={AddReport}
            layout={MainLayout}
          />
          <PrivateRoute
            exact
            path="/reports/:id"
            component={ViewReport}
            layout={MainLayout}
          />
        </Suspense>

        <Switch>
          <PrivateRoute
            exact
            path="/overview"
            component={Overview}
            layout={MainLayout}
          />
          <PrivateRoute
            exact
            path="/download"
            component={DownloadView}
            layout={MainLayout}
          />
          <PrivateRoute
            extact
            path="/registry"
            component={Devices}
            layout={MainLayout}
          />
          <PrivateRoute
            component={NotFoundView}
            exact
            layout={MinimalLayout}
            path="/not-found"
          />
        </Switch>
        <div
          style={{
            position: "fixed",
            bottom: 0,
            right: 0,
            marginRight: "10px",
            marginBottom: "20px",
          }}
        >
          <div id="jira-help-desk" />
        </div>
      </div>
    </Router>
  );
};

export default AppRoutes;
