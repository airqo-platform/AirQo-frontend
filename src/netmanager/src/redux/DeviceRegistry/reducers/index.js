import { combineReducers } from 'redux';
import devices from './device';
import maintenanceLogs from './maintenanceLogs';
import upTime from './uptime';
import batteryVoltage from './batteryVoltage';
import sensorCorrelation from './sensorCorrelation';

export default combineReducers({
  devices,
  maintenanceLogs,
  upTime,
  batteryVoltage,
  sensorCorrelation
});
