import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {Route, Switch, Redirect, useParams, useRouteMatch} from "react-router-dom";
import 'chartjs-plugin-annotation';
import { isEmpty } from "underscore";
import { DeviceToolBar, DeviceToolBarContainer } from "./DeviceToolBar";
import DeviceDeployStatus from "./DeviceDeployStatus";
import DeviceLogs from "./DeviceLogs";
import DevicePhotos from "./DevicePhotos";
import DeviceComponents from "./DeviceComponents";
import DeviceOverview from "./DeviceOverview";
import { useDevicesData } from "redux/DeviceRegistry/selectors";
import { loadDevicesData } from "redux/DeviceRegistry/operations";



export default function DeviceView() {
  const dispatch = useDispatch();
  const match = useRouteMatch();
  const params = useParams();
  const devices = useDevicesData();
  const [deviceData, setDeviceData] = useState(devices[params.deviceId] || {});

  useEffect(()  => {
    if (isEmpty(devices)) {
      dispatch(loadDevicesData())
    }
  }, []);

  useEffect(()  => {
    setDeviceData(devices[params.deviceId] || {})
  }, [devices]);

  return (
    <div>
      <DeviceToolBar deviceName={deviceData.name} />
      <DeviceToolBarContainer>
        <Switch>
          <Route
              exact
              path={'/device/:deviceId/overview'}
              component={DeviceOverview}
          />
          <Route
              exact
              path={'/device/:deviceId/maintenance-logs'}
              component={() => <DeviceLogs deviceName={deviceData.name} deviceLocation={deviceData.locationID} />}
          />
          <Route
              exact
              path={'/device/:deviceId/deploy-status'}
              component={() => <DeviceDeployStatus deviceName={deviceData.name} /> }
          />
          <Route
              exact
              path={'/device/:deviceId/components'}
              component={() => <DeviceComponents deviceName={deviceData.name} />}
          />
          <Route
              exact
              path={'/device/:deviceId/photos'}
              component={DevicePhotos}
          />
          <Redirect to={`${match.url}/overview`} />
        </Switch>
      </DeviceToolBarContainer>
    </div>
  );
}
