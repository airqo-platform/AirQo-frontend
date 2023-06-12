import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch, Redirect, useParams, useRouteMatch } from 'react-router-dom';
import 'chartjs-plugin-annotation';
import { isEmpty } from 'underscore';

//css
import 'assets/css/device-view.css';

// others
import { DeviceToolBar, DeviceToolBarContainer } from './DeviceToolBar';
import DeviceEdit from './DeviceEdit';
import DeviceLogs from './DeviceLogs';
import DevicePhotos from './DevicePhotos';
import DeviceOverview from './DeviceOverview/DeviceOverview';
import { useInitScrollTop } from 'utils/customHooks';
import { withPermission } from '../../../containers/PageAccess';
import { getOrgDevices, updateDeviceDetails } from '../../../../redux/DeviceOverview/OverviewSlice';

const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));

const DeviceView = () => {
  useInitScrollTop();
  const dispatch = useDispatch();
  const match = useRouteMatch();
  const params = useParams();
  const devices = useSelector((state) => state.deviceOverviewData.devices);
  let deviceData = {};

  const selectedDevice = devices.filter((device) => device.name === params.deviceName);
  selectedDevice.forEach((device) => {
    deviceData = { ...device };
  });

  useEffect(() => {
    if (isEmpty(devices)) {
      dispatch(getOrgDevices(activeNetwork.net_name));
      dispatch(updateDeviceDetails(deviceData));
    }
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
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
            component={() => <DeviceEdit deviceData={deviceData} />}
          />
          <Route
            exact
            path={`${match.url}/maintenance-logs`}
            component={() => (
              <DeviceLogs deviceName={deviceData.name} deviceLocation={deviceData.locationID} />
            )}
          />
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
};

export default withPermission(DeviceView, 'CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES');
