import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Route,
  Switch,
  Redirect,
  useParams,
  useRouteMatch,
} from "react-router-dom";
import "chartjs-plugin-annotation";
import { isEmpty } from "underscore";

//css
import "assets/css/device-view.css";

// others
import { DeviceToolBar, DeviceToolBarContainer } from "./DeviceToolBar";
import DeviceEdit from "./DeviceEdit";
import DeviceLogs from "./DeviceLogs";
import DevicePhotos from "./DevicePhotos";
import DeviceComponents from "./DeviceComponents";
import DeviceOverview from "./DeviceOverview/DeviceOverview";
import { useDevicesData } from "redux/DeviceRegistry/selectors";
import { loadDevicesData } from "redux/DeviceRegistry/operations";
import { useInitScrollTop } from "utils/customHooks";

export default function DeviceView() {
  const dispatch = useDispatch();
  const match = useRouteMatch();
  const params = useParams();
  const devices = useDevicesData();
  const [deviceData, setDeviceData] = useState(
    devices[params.deviceName] || {}
  );

  useInitScrollTop();

  useEffect(() => {
    if (isEmpty(devices)) {
      dispatch(loadDevicesData());
    }
  }, []);

  useEffect(() => {
    setDeviceData(devices[params.deviceName] || {});
  }, [devices]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      <DeviceToolBar deviceName={deviceData.name} />
      <DeviceToolBarContainer>
        <Switch>
          <Route
            exact
            path={`${match.url}/overview`}
            component={() => <DeviceOverview deviceData={deviceData} />}
          />
          <Route
            exact
            path={`${match.url}/edit`}
            component={() => (
              <DeviceEdit deviceData={deviceData} />
            )}
          />
          <Route
            exact
            path={`${match.url}/maintenance-logs`}
            component={() => (
              <DeviceLogs
                deviceName={deviceData.name}
                deviceLocation={deviceData.locationID}
              />
            )}
          />
          {/*<Route*/}
          {/*  exact*/}
          {/*  path={`${match.url}/components`}*/}
          {/*  component={() => <DeviceComponents deviceName={deviceData.name} />}*/}
          {/*/>*/}
          <Route
            exact
            path={`${match.url}/photos`}
            component={() => <DevicePhotos deviceData={deviceData} />}
          />
          <Redirect to={`${match.url}/overview`} />
        </Switch>
      </DeviceToolBarContainer>
    </div>
  );
}
