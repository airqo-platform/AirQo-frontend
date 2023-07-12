import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'underscore';
import { useDeviceUptimeData } from 'redux/DeviceManagement/selectors';
import { loadSingleDeviceUptime } from 'redux/DeviceManagement/operations';
import { roundToEndOfDay, roundToStartOfDay } from 'utils/dateTime';
import moment from 'moment';
import DeviceUptimeChart from './UptimeChart';
import DeviceVoltageChart from './VoltageChart';
import DeviceSensorChart from './SensorChart';
import PropTypes from 'prop-types';
import { loadDeviceBatteryVoltage } from '../../../../../redux/DeviceRegistry/operations';

const DeviceOverviewCharts = ({ deviceName }) => {
  const dispatch = useDispatch();

  const deviceUptimeData = useDeviceUptimeData(deviceName);
  const deviceBatteryVoltageData = useSelector((state) => state.deviceRegistry.batteryVoltage);

  useEffect(() => {
    if (isEmpty(deviceUptimeData) && deviceName) {
      dispatch(
        loadSingleDeviceUptime({
          device_name: deviceName,
          startDate: roundToStartOfDay(
            moment(new Date()).subtract(3, 'days').toISOString()
          ).toISOString(),
          endDate: roundToEndOfDay(new Date().toISOString()).toISOString()
        })
      );
    }
  }, []);

  useEffect(() => {
    if (deviceName && isEmpty(deviceBatteryVoltageData.deviceData)) {
      dispatch(
        loadDeviceBatteryVoltage({
          deviceName: deviceName,
          startDate: roundToStartOfDay(
            moment(new Date()).subtract(3, 'days').toISOString()
          ).toISOString(),
          endDate: roundToEndOfDay(new Date().toISOString()).toISOString()
        })
      );
    }
  });

  return (
    <>
      <DeviceUptimeChart deviceUptimeData={deviceUptimeData} />

      <DeviceVoltageChart deviceUptimeData={deviceBatteryVoltageData.deviceData} />

      <DeviceSensorChart deviceUptimeData={deviceUptimeData} />
    </>
  );
};

DeviceOverviewCharts.propTypes = {
  deviceName: PropTypes.string.isRequired
};

export default DeviceOverviewCharts;
