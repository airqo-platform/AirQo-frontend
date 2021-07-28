// for representing chained operations using redux-thunk
import {
  LOAD_ALL_DEVICES_SUCCESS,
  LOAD_ALL_DEVICES_FAILURE,
  LOAD_MAINTENANCE_LOGS_SUCCESS,
  LOAD_MAINTENANCE_LOGS_FAILURE,
  LOAD_DEVICE_COMPONENTS_SUCCESS,
  LOAD_DEVICE_COMPONENTS_FAILURE,
  INSERT_MAINTENANCE_LOGS_SUCCESS,
  INSERT_NEW_COMPONENT_SUCCESS,
  INSERT_NEW_DEVICE_SUCCESS,
  RESET_DEVICE_SUCCESS,
  RESET_DEVICE_COMPONENTS_SUCCESS,
  RESET_MAINTENANCE_LOGS,
  UPDATE_SINGLE_DEVICE_SUCCESS,
  UPDATE_SINGLE_MAINTENANCE_LOGS_SUCCESS,
  UPDATE_SINGLE_COMPONENT_SUCCESS,
  DELETE_SINGLE_MAINTENANCE_LOGS_SUCCESS,
  LOAD_DEVICE_UPTIME_SUCCESS,
  LOAD_DEVICE_UPTIME_FAILURE,
  LOAD_DEVICE_BATTERY_VOLTAGE_SUCCESS,
  LOAD_DEVICE_BATTERY_VOLTAGE_FAILURE,
  LOAD_DEVICE_SENSOR_CORRELATION_SUCCESS,
  LOAD_DEVICE_SENSOR_CORRELATION_FAILURE,
} from "./actions";
import { transformArray } from "../utils";
import {
  getAllDevicesApi,
  getDeviceMaintenanceLogsApi,
  getDeviceComponentsApi,
  deleteDeviceApi,
} from "views/apis/deviceRegistry";
import {
  getDeviceUptimeApi,
  getDeviceBatteryVoltageApi,
  getDeviceSensorCorrelationApi,
} from "views/apis/deviceMonitoring";

import { updateMainAlert } from "../MainAlert/operations";

export const loadDevicesData = () => {
  return async (dispatch) => {
    return await getAllDevicesApi()
      .then((responseData) => {
        if (responseData.devices) {
          dispatch({
            type: LOAD_ALL_DEVICES_SUCCESS,
            payload: transformArray(responseData.devices, "name"),
          });
        }
      })
      .catch((err) => console.log(err));
  };
};

export const updateDevice = (deviceName, data) => (dispatch) => {
  dispatch({
    type: UPDATE_SINGLE_DEVICE_SUCCESS,
    payload: { deviceName, data },
  });
};

export const loadDeviceMaintenanceLogs = (deviceName) => {
  return async (dispatch) => {
    return await getDeviceMaintenanceLogsApi(deviceName)
      .then((responseData) => {
        const indexedLogs = [];
        // sort logs in reversed order
        responseData.sort(
          (log1, log2) => -(new Date(log1.date) - new Date(log2.date))
        );
        responseData.map((log, tableIndex) =>
          indexedLogs.push({ ...log, tableIndex })
        );
        dispatch({
          type: LOAD_MAINTENANCE_LOGS_SUCCESS,
          payload: { [deviceName]: indexedLogs },
        });
      })
      .catch((err) => console.log(err));
  };
};

export const loadDeviceComponentsData = (deviceName) => {
  return async (dispatch) => {
    return await getDeviceComponentsApi(deviceName)
      .then((responseData) => {
        const indexedComponent = [];
        responseData.components.map((comp, tableIndex) =>
          indexedComponent.push({ ...comp, tableIndex })
        );
        dispatch({
          type: LOAD_DEVICE_COMPONENTS_SUCCESS,
          payload: { [deviceName]: indexedComponent },
        });
      })
      .catch((err) => console.log(err));
  };
};

export const resetDeviceRegistryState = () => (dispatch) => {
  dispatch({ type: RESET_DEVICE_SUCCESS });
  dispatch({ type: RESET_DEVICE_COMPONENTS_SUCCESS });
  dispatch({ type: RESET_MAINTENANCE_LOGS });
};

export const insertMaintenanceLog = (deviceName, log) => (dispatch) => {
  dispatch({
    type: INSERT_MAINTENANCE_LOGS_SUCCESS,
    payload: { deviceName, log },
  });
};

export const updateMaintenanceLog = (deviceName, index, log) => (dispatch) => {
  dispatch({
    type: UPDATE_SINGLE_MAINTENANCE_LOGS_SUCCESS,
    payload: { deviceName, index, log },
  });
};

export const deleteMaintenanceLog = (deviceName, index) => (dispatch) => {
  dispatch({
    type: DELETE_SINGLE_MAINTENANCE_LOGS_SUCCESS,
    payload: { deviceName, index },
  });
};

export const insertDeviceComponent = (deviceName, component) => (dispatch) => {
  dispatch({
    type: INSERT_NEW_COMPONENT_SUCCESS,
    payload: { deviceName, component },
  });
};

export const updateDeviceComponent = (deviceName, index, component) => (
  dispatch
) => {
  dispatch({
    type: UPDATE_SINGLE_COMPONENT_SUCCESS,
    payload: { deviceName, index, component },
  });
};

export const loadDeviceUpTime = (deviceName, params) => async (dispatch) => {
  return await getDeviceUptimeApi(params)
    .then((responseData) => {
        console.log('response data', responseData)
      dispatch({
        type: LOAD_DEVICE_UPTIME_SUCCESS,
        payload: { deviceName, data: responseData },
      });
    })
    .catch(() => {
      dispatch({
        type: LOAD_DEVICE_UPTIME_FAILURE,
      });
    });
};

export const loadDeviceBatteryVoltage = (deviceName) => async (dispatch) => {
  return await getDeviceBatteryVoltageApi({ device_name: deviceName })
    .then((responseData) => {
      if (
        typeof responseData.success !== "undefined" &&
        !responseData.success
      ) {
        dispatch({
          type: LOAD_DEVICE_BATTERY_VOLTAGE_FAILURE,
        });
        return;
      }
      dispatch({
        type: LOAD_DEVICE_BATTERY_VOLTAGE_SUCCESS,
        payload: { deviceName, data: responseData },
      });
    })
    .catch(() => {
      dispatch({
        type: LOAD_DEVICE_BATTERY_VOLTAGE_FAILURE,
      });
    });
};

export const loadDeviceSesnorCorrelation = (deviceName) => async (dispatch) => {
  return await getDeviceSensorCorrelationApi({ device_name: deviceName })
    .then((responseData) => {
      if (
        typeof responseData.success !== "undefined" &&
        !responseData.success
      ) {
        dispatch({
          type: LOAD_DEVICE_SENSOR_CORRELATION_FAILURE,
        });
        return;
      }
      dispatch({
        type: LOAD_DEVICE_SENSOR_CORRELATION_SUCCESS,
        payload: { deviceName, data: responseData },
      });
    })
    .catch(() => {
      dispatch({
        type: LOAD_DEVICE_SENSOR_CORRELATION_FAILURE,
      });
    });
};

export const insertNewDevice = (newDevice) => (dispatch) => {
  dispatch({
    type: INSERT_NEW_DEVICE_SUCCESS,
    payload: newDevice,
  });
};

export const deleteDevice = (deviceName) => async (dispatch, getState) => {
  return await deleteDeviceApi(deviceName)
    .then(() => {
      const state = getState();
      const devices = state.deviceRegistry.devices;
      delete devices[deviceName];
      dispatch({
        type: LOAD_ALL_DEVICES_SUCCESS,
        payload: devices,
      });
      dispatch(
        updateMainAlert({
          show: true,
          message: `device ${deviceName} deleted successfully`,
          severity: "success",
        })
      );
    })
    .catch((err) => {
      dispatch(
        updateMainAlert({
          show: true,
          message: `deletion of  ${deviceName} failed`,
          severity: "error",
        })
      );
    });
};
