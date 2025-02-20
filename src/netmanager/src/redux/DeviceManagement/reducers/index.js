import { combineReducers } from 'redux';
import deviceStatus from './devicesStatus';
import devicesUptime from './devicesUptime';
import networkUptime from './networkUptime';
import uptimeLeaderboard from './uptimeLeaderboard';
import {
  devicesReducer as devices,
  filteredDevicesReducer as filteredDevices,
  activeFiltersReducer as activeFilters
} from './devices';
import airqloudUptime from './airqloudUptime';

export default combineReducers({
  deviceStatus,
  devicesUptime,
  networkUptime,
  airqloudUptime,
  uptimeLeaderboard,
  devices,
  filteredDevices,
  activeFilters
});
