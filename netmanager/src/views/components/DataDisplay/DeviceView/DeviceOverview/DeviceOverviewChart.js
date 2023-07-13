import React, { useEffect, useState } from 'react';
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
import { loadDeviceBatteryVoltage } from 'redux/DeviceRegistry/operations';
import { TextField } from '@material-ui/core';

const DeviceOverviewCharts = ({ deviceName }) => {
  const dispatch = useDispatch();
  const [minutesAverage, setMinutesAverage] = useState('');

  const deviceUptimeData = useDeviceUptimeData(deviceName);
  const deviceBatteryVoltageData = useSelector((state) => state.deviceRegistry.batteryVoltage);

  useEffect(() => {
    if (deviceName) {
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
  }, [deviceName]);

  useEffect(() => {
    if (deviceName) {
      dispatch(
        loadDeviceBatteryVoltage({
          deviceName: deviceName,
          startDate: roundToStartOfDay(
            moment(new Date()).subtract(3, 'days').toISOString()
          ).toISOString(),
          endDate: roundToEndOfDay(new Date().toISOString()).toISOString(),
          roundingValue: 2,
          minutesAverage: minutesAverage
        })
      );
    }
  }, [deviceName, minutesAverage]);

  return (
    <>
      <DeviceUptimeChart deviceUptimeData={deviceUptimeData} />

      <DeviceVoltageChart
        deviceUptimeData={deviceBatteryVoltageData.deviceData}
        controllerChildren={
          <>
            <TextField
              select
              label="Minutes Average"
              id="minutesAverage"
              fullWidth
              style={{ marginTop: '15px' }}
              value={minutesAverage}
              onChange={(e) => {
                setMinutesAverage(e.target.value);
              }}
              SelectProps={{
                native: true,
                style: { width: '100%', height: '40px' }
              }}
              variant="outlined"
            >
              <option value={'5'}>5</option>
              <option value={'20'}>10</option>
              <option value={'30'}>20</option>
              <option value={'30'}>30</option>
              <option value={'45'}>40</option>
              <option value={'60'}>60</option>
              <option value={'90'}>80</option>
              <option value={'90'}>100</option>
              <option value={'120'}>120</option>
            </TextField>
          </>
        }
      />

      <DeviceSensorChart deviceUptimeData={deviceUptimeData} />
    </>
  );
};

DeviceOverviewCharts.propTypes = {
  deviceName: PropTypes.string.isRequired
};

export default DeviceOverviewCharts;
