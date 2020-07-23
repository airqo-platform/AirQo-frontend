const prodConfig = {
  VERIFY_TOKEN_URI: "http://34.78.78.202:30000/api/v1/users/reset",
  UPDATE_PWD_URI:
    "http://34.78.78.202:30000/api/v1/users/updatePasswordViaEmail",
  FORGOT_PWD_URI: "http://34.78.78.202:30000/api/v1/users/forgotPassword",
  LOGIN_USER_URI: "http://34.78.78.202:30000/api/v1/users/loginUser",
  REGISTER_USER_URI: "http://34.78.78.202:30000/api/v1/users/registerUser",
  REGISTER_CANDIDATE_URI:
    "http://34.78.78.202:30000/api/v1/users/registerCandidate",
  REJECT_USER_URI: "http://34.78.78.202:30000/api/v1/users/deny",
  ACCEPT_USER_URI: "http://34.78.78.202:30000/api/v1/users/accept",
  GET_USERS_URI: "http://34.78.78.202:30000/api/v1/users/",
  ALL_LOCATIONS_URI:
    "http://34.78.78.202:30005/api/v1/location_registry/locations",
  CREATE_ID_URI: "http://34.78.78.202:30005/api/v1/location_registry/create_id",
  REGISTER_LOCATION_URI:
    "http://34.78.78.202:30005/api/v1/location_registry/register",
  VIEW_LOCATION_URI:
    "http://34.78.78.202:30005/api/v1/location_registry/location?loc_ref=",
  EDIT_LOCATION_DETAILS_URI:
    "http://34.78.78.202:30005/api/v1/location_registry/edit?loc_ref=",
  UPDATE_LOCATION_URI:
    "http://34.78.78.202:30005/api/v1/location_registry/update",
  RUN_LOCATE_MODEL: "http://34.78.78.202:30004/api/v1/map/parishes",
  SAVE_LOCATE_MAP: "http://34.78.78.202:30004/api/v1/map/savelocatemap",
  GET_LOCATE_MAP: "http://34.78.78.202:30004/api/v1/map/getlocatemap/",
  UPDATE_LOCATE_MAP: "http://34.78.78.202:30004/api/v1/map/updatelocatemap/",
  DELETE_LOCATE_MAP: "http://34.78.78.202:30004/api/v1/map/deletelocatemap/",
  GET_DEVICE_STATUS_SUMMARY:
    "http://34.78.78.202:30006/api/v1/device/monitor/status",
  GET_DEVICE_MAINTENANCE_LOG:
    "http://34.78.78.202:30006/api/v1/device/monitor/maintenance_log",
  GET_DEVICE_POWER_TYPE:
    "http://34.78.78.202:30006/api/v1/device/monitor/power_type",
  GET_DEVICE_STATUS_FOR_PIECHART_DISPLAY:
    "http://34.78.78.202:30006/api/v1/device/monitor/status/latest",
  GET_LATEST_OFFLINE_DEVICES:
    "http://34.78.78.202:30006/api/v1/monitor/devices/offline",
  GET_NETWORK_UPTIME: "http://34.78.78.202:30006/api/v1/monitor/network/uptime",
  GET_DEVICE_UPTIME: "http://34.78.78.202:30006/api/v1/monitor/device/uptime/",
  ADD_MAINTENANCE_URI:
    "http://34.78.78.202:30001/api/v1/data/channels/maintenance/add",
  REGISTER_DEVICE_URI: "http://34.78.78.202:30002/api/v1/devices/ts",
  ALL_DEVICES_URI: "http://34.78.78.202:30002/api/v1/devices",
  DEPLOY_DEVICE_URI:
    "http://34.78.78.202:30002/api/v1/devices/ts/deploy/device",
  DELETE_DEVICE_URI:
    "http://34.78.78.202:30002/api/v1/devices/ts/delete?device=",
  GET_NETWORK_BEST_PERFORMING_DEVICES:
    "http://34.78.78.202:30006/api/v1/monitor/network/devices/bestperforming",
  GET_NETWORK_WORST_PERFORMING_DEVICES:
    "http://34.78.78.202:30006/api/v1/monitor/network/devices/worstperforming",
};

const devConfig = {
  VERIFY_TOKEN_URI: "http://localhost:3000/api/v1/users/reset",
  UPDATE_PWD_URI: "http://localhost:3000/api/v1/users/updatePasswordViaEmail",
  FORGOT_PWD_URI: "http://localhost:3000/api/v1/users/forgotPassword",
  LOGIN_USER_URI: "http://localhost:3000/api/v1/users/loginUser",
  REGISTER_USER_URI: "http://localhost:3000/api/v1/users/registerUser",
  REGISTER_CANDIDATE_URI:
    "http://localhost:3000/api/v1/users/registerCandidate",
  REJECT_USER_URI: "http://localhost:3000/api/v1/users/deny",
  ACCEPT_USER_URI: "http://localhost:3000/api/v1/users/accept",
  GET_USERS_URI: "http://localhost:3000/api/v1/users/",
  RUN_LOCATE_MODEL: "http://localhost:4000/api/v1/map/parishes",
  SAVE_LOCATE_MAP: "http://localhost:4000/api/v1/map/savelocatemap",
  GET_LOCATE_MAP: "http://localhost:4000/api/v1/map/getlocatemap/",
  UPDATE_LOCATE_MAP: "http://localhost:4000/api/v1/map/updatelocatemap/",
  DELETE_LOCATE_MAP: "http://localhost:4000/api/v1/map/deletelocatemap/",
  GET_DEVICE_STATUS_SUMMARY:
    "http://localhost:4001/api/v1/device/monitor/status",
  GET_DEVICE_MAINTENANCE_LOG:
    "http://localhost:4001/api/v1/device/monitor/maintenance_log",
  GET_DEVICE_POWER_TYPE:
    "http://localhost:4001/api/v1/device/monitor/power_type",
  GET_DEVICE_STATUS_FOR_PIECHART_DISPLAY:
    "http://localhost:4001/api/v1/device/monitor/status/latest",
  GET_LATEST_OFFLINE_DEVICES:
    "http://localhost:4001/api/v1/monitor/devices/offline",
  GET_NETWORK_UPTIME: "http://localhost:4001/api/v1/monitor/network/uptime",
  GET_DEVICE_UPTIME: "http://localhost:4001/api/v1/monitor/device/uptime/",
  GET_NETWORK_BEST_PERFORMING_DEVICES:
    "http://localhost:4001/api/v1/monitor/network/devices/bestperforming",
  GET_NETWORK_WORST_PERFORMING_DEVICES:
    "http://localhost:4001/api/v1/monitor/network/devices/worstperforming",
  ALL_LOCATIONS_URI: "http://127.0.0.1:4001/api/v1/location_registry/locations",
  CREATE_ID_URI: "http://127.0.0.1:4000/api/v1/location_registry/create_id",
  REGISTER_LOCATION_URI:
    "http://127.0.0.1:4001/api/v1/location_registry/register",
  VIEW_LOCATION_URI:
    "http://127.0.0.1:4001/api/v1/location_registry/location?loc_ref=",
  EDIT_LOCATION_DETAILS_URI:
    "http://127.0.0.1:4001/api/v1/location_registry/edit?loc_ref=",
  UPDATE_LOCATION_URI: "http://127.0.0.1:4000/api/v1/location_registry/update",
  ADD_MAINTENANCE_URI:
    "http://localhost:3000/api/v1/data/channels/maintenance/add",
  REGISTER_DEVICE_URI: "http://localhost:6000/api/v1/devices/ts",
  ALL_DEVICES_URI: "http://localhost:5000/api/v1/devices",
  //DEPLOY_DEVICE_URI: "http://127.0.0.1:5000/api/v1/devices/ts/deploy/device",
  EDIT_DEVICE_URI: "http://localhost:5000/api/v1/devices/ts/update?device=",
  ALL_SENSORS_URI: "http://127.0.0.1:5000/api/v1/devices/get/sensors",
  DEVICES_IN_LOCATION_URI: "http://localhost:5000/api/v1/devices/by/location?loc=",
  DEPLOY_DEVICE_URI: "http://localhost:5000/api/v1/devices/ts/activity?type="
  //DELETE_DEVICE_URI: "http://127.0.0.1:3000/api/api/v1/devices/ts/delete?device="
};

function runConfig(env) {
  switch (env) {
    case "development":
      return devConfig;
    default:
      return prodConfig;
  }
}

export default { ...runConfig(process.env.NODE_ENV) };
