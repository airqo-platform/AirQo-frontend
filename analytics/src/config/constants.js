/* eslint-disable */
const devConfig = {
  VERIFY_TOKEN_URI: "http://localhost:3000/api/v1/users/reset/you",
  UPDATE_PWD_URI: "http://localhost:3000/api/v1/users/updatePasswordViaEmail",
  UPDATE_PWD_IN_URI: "http://localhost:3000/api/v1/users/updatePassword",
  FORGOT_PWD_URI: "http://localhost:3000/api/v1/users/forgotPassword",
  LOGIN_USER_URI: "http://localhost:3000/api/v1/users/loginUser",
  REGISTER_USER_URI: "http://localhost:3000/api/v1/users/registerUser",
  REGISTER_CANDIDATE_URI:
    "http://localhost:3000/api/v1/users/register/new/candidate",
  REJECT_USER_URI: "http://localhost:3000/api/v1/users/deny",
  ACCEPT_USER_URI: "http://localhost:3000/api/v1/users/accept",
  GET_USERS_URI: "http://localhost:3000/api/v1/users/",
  GET_CANDIDATES_URI: "http://localhost:3000/api/v1/users/candidates/fetch",
  DEFAULTS_URI: "http://localhost:3000/api/v1/users/defaults",
  GENERATE_CUSTOMISABLE_CHARTS_URI:
    "http://127.0.0.1:5000/api/v1/dashboard/customisedchart",
  GET_CUSTOMISABLE_CHART_INITIAL_DATA_URI:
    "http://127.0.0.1:5000/api/v1/dashboard/customisedchart/random",
  GET_MONITORING_SITES_LOCATIONS_URI:
    "http://127.0.0.1:5000/api/v1/dashboard/monitoringsites/locations?organisation_name=KCCA",
  GET_PM25_CATEGORY_COUNT_URI:
    "http://127.0.0.1:5000/api/v1/dashboard/locations/pm25categorycount?organisation_name=KCCA",
  GET_HISTORICAL_DAILY_MEAN_AVERAGES_FOR_LAST_28_DAYS_URI:
    "http://127.0.0.1:5000/api/v1/dashboard/historical/daily/devices",
  GENERATE_DEVICE_GRAPH_URI: "http://127.0.0.1:5000/api/v1/device/graph",
  DOWNLOAD_DATA: "http://127.0.0.1:5000/api/v1/data/download?type=",
  GET_DEFAULT_REPORT_TEMPLATE_URI:
    "http://127.0.0.1:5000/api/v1/report/get_default_report_template",
  SAVE_MONTHLY_REPORT_URI:
    "http://127.0.0.1:5000/api/v1/report/save_monthly_report",
  GET_MONTHLY_REPORT_URI:
    "http://127.0.0.1:5000/api/v1/report/get_monthly_report/",
  DELETE_MONTHLY_REPORT_URI:
    "http://127.0.0.1:5000/api/v1/report/delete_monthly_report/",
  UPDATE_MONTHLY_REPORT_URI:
    "http://127.0.0.1:5000/api/v1/report/update_monthly_report/",
  EXCEEDANCES_URI: "http://127.0.0.1:5000/api/v1/dashboard/exceedances",
  GET_MONITORING_SITES_URI:
    "http://127.0.0.1:5000/api/v1/dashboard/monitoringsites?organisation_name=KCCA",
};
const testConfig = {
  VERIFY_TOKEN_URI: "http://localhost:3000/api/v1/users/reset/you",
  UPDATE_PWD_URI: "http://localhost:3000/api/v1/users/updatePasswordViaEmail",
  UPDATE_PWD_IN_URI: "http://localhost:3000/api/v1/users/updatePassword",
  FORGOT_PWD_URI: "http://localhost:3000/api/v1/users/forgotPassword",
  LOGIN_USER_URI: "http://localhost:3000/api/v1/users/loginUser",
  REGISTER_USER_URI: "http://localhost:3000/api/v1/users/registerUser",
  REGISTER_CANDIDATE_URI:
    "http://localhost:3000/api/v1/users/register/new/candidate",
  REJECT_USER_URI: "http://localhost:3000/api/v1/users/deny",
  ACCEPT_USER_URI: "http://localhost:3000/api/v1/users/accept",
  GET_USERS_URI: "http://localhost:3000/api/v1/users/",
  GET_CANDIDATES_URI: "http://localhost:3000/api/v1/users/candidates/fetch",
  DEFAULTS_URI: "http://localhost:3000/api/v1/users/defaults",
};

const stageConfig = {
  VERIFY_TOKEN_URI: "http://34.78.78.202:31000/api/v1/users/reset/you",
  UPDATE_PWD_URI:
    "http://34.78.78.202:31000/api/v1/users/updatePasswordViaEmail",
  UPDATE_PWD_IN_URI: "http://34.78.78.202:31000/api/v1/users/updatePassword",
  FORGOT_PWD_URI: "http://34.78.78.202:31000/api/v1/users/forgotPassword",
  LOGIN_USER_URI: "http://34.78.78.202:31000/api/v1/users/loginUser",
  REGISTER_USER_URI: "http://34.78.78.202:31000/api/v1/users/registerUser",
  REGISTER_CANDIDATE_URI:
    "http://34.78.78.202:31000/api/v1/users/register/new/candidate",
  REJECT_USER_URI: "http://34.78.78.202:31000/api/v1/users/deny",
  ACCEPT_USER_URI: "http://34.78.78.202:31000/api/v1/users/accept",
  GET_USERS_URI: "http://34.78.78.202:31000/api/v1/users/",
  GET_CANDIDATES_URI: "http://34.78.78.202:31000/api/v1/users/candidates/fetch",
  DEFAULTS_URI: "http://34.78.78.202:31000/api/v1/users/defaults",
  GENERATE_CUSTOMISABLE_CHARTS_URI:
    "http://34.78.78.202:31003/api/v1/dashboard/customisedchart",
  GET_CUSTOMISABLE_CHART_INITIAL_DATA_URI:
    "http://34.78.78.202:31003/api/v1/dashboard/customisedchart/random",
  GET_MONITORING_SITES_LOCATIONS_URI:
    "http://34.78.78.202:31003/api/v1/dashboard/monitoringsites/locations?organisation_name=KCCA",
  GET_PM25_CATEGORY_COUNT_URI:
    "http://34.78.78.202:31003/api/v1/dashboard/locations/pm25categorycount?organisation_name=KCCA",
  GET_HISTORICAL_DAILY_MEAN_AVERAGES_FOR_LAST_28_DAYS_URI:
    "http://34.78.78.202:31003/api/v1/dashboard/historical/daily/devices",
  GENERATE_DEVICE_GRAPH_URI: "http://34.78.78.202:31003/api/v1/device/graph",
  DOWNLOAD_DATA: "http://34.78.78.202:31003/api/v1/data/download?type=",
  GET_DEFAULT_REPORT_TEMPLATE_URI:
    "http://34.78.78.202:31003/api/v1/report/get_default_report_template",
  SAVE_MONTHLY_REPORT_URI:
    "http://34.78.78.202:31003/api/v1/report/save_monthly_report",
  GET_MONTHLY_REPORT_URI:
    "http://34.78.78.202:31003/api/v1/report/get_monthly_report/",
  DELETE_MONTHLY_REPORT_URI:
    "http://34.78.78.202:31003/api/v1/report/delete_monthly_report/",
  UPDATE_MONTHLY_REPORT_URI:
    "http://34.78.78.202:31003/api/v1/report/update_monthly_report/",
  EXCEEDANCES_URI: "http://34.78.78.202:31003/api/v1/dashboard/exceedances",
  GET_MONITORING_SITES_URI:
    "http://34.78.78.202:31003/api/v1/dashboard/monitoringsites?organisation_name=KCCA",
};
const prodConfig = {
  VERIFY_TOKEN_URI: "http://34.78.78.202:30000/api/v1/users/reset/you",
  UPDATE_PWD_URI:
    "http://34.78.78.202:30000/api/v1/users/updatePasswordViaEmail",
  UPDATE_PWD_IN_URI: "http://34.78.78.202:30000/api/v1/users/updatePassword",
  FORGOT_PWD_URI: "http://34.78.78.202:30000/api/v1/users/forgotPassword",
  LOGIN_USER_URI: "http://34.78.78.202:30000/api/v1/users/loginUser",
  REGISTER_USER_URI: "http://34.78.78.202:30000/api/v1/users/registerUser",
  REGISTER_CANDIDATE_URI:
    "http://34.78.78.202:30000/api/v1/users/register/new/candidate",
  REJECT_USER_URI: "http://34.78.78.202:30000/api/v1/users/deny",
  ACCEPT_USER_URI: "http://34.78.78.202:30000/api/v1/users/accept",
  GET_USERS_URI: "http://34.78.78.202:30000/api/v1/users/",
  GET_CANDIDATES_URI: "http://34.78.78.202:30000/api/v1/users/candidates/fetch",
  DEFAULTS_URI: "http://34.78.78.202:30000/api/v1/users/defaults",
  GENERATE_CUSTOMISABLE_CHARTS_URI:
    "http://34.78.78.202:30003/api/v1/dashboard/customisedchart",
  GET_CUSTOMISABLE_CHART_INITIAL_DATA_URI:
    "http://34.78.78.202:30003/api/v1/dashboard/customisedchart/random",
  GET_MONITORING_SITES_LOCATIONS_URI:
    "http://34.78.78.202:30003/api/v1/dashboard/monitoringsites/locations?organisation_name=KCCA",
  GET_PM25_CATEGORY_COUNT_URI:
    "http://34.78.78.202:30003/api/v1/dashboard/locations/pm25categorycount?organisation_name=KCCA",
  GET_HISTORICAL_DAILY_MEAN_AVERAGES_FOR_LAST_28_DAYS_URI:
    "http://34.78.78.202:30003/api/v1/dashboard/historical/daily/devices",
  GENERATE_DEVICE_GRAPH_URI: "http://34.78.78.202:30003/api/v1/device/graph",
  DOWNLOAD_CUSTOMISED_DATA_URI:
    "http://34.78.78.202:30003/api/v1/data/download",
  GET_DEFAULT_REPORT_TEMPLATE_URI:
    "http://34.78.78.202:30003/api/v1/report/get_default_report_template",
  SAVE_MONTHLY_REPORT_URI:
    "http://34.78.78.202:30003/api/v1/report/save_monthly_report",
  GET_MONTHLY_REPORT_URI:
    "http://34.78.78.202:30003/api/v1/report/get_monthly_report/",
  DELETE_MONTHLY_REPORT_URI:
    "http://34.78.78.202:30003/api/v1/report/delete_monthly_report/",
  UPDATE_MONTHLY_REPORT_URI:
    "http://34.78.78.202:30003/api/v1/report/update_monthly_report/",
  EXCEEDANCES_URI: "http://34.78.78.202:30003/api/v1/dashboard/exceedances",
  GET_MONITORING_SITES_URI:
    "http://34.78.78.202:30003/api/v1/dashboard/monitoringsites?organisation_name=KCCA",
};
const defaultConfig = {
  PORT: process.env.PORT || 5000,
  NODE_PATH: process.env.NODE_PATH || "src",
};

function envConfig(env) {
  switch (env) {
    case "development":
      return devConfig;
    case "test":
      return testConfig;
    case "stage":
      return stageConfig;
    default:
      return prodConfig;
  }
}

export default {
  ...defaultConfig,
  ...envConfig(process.env.NODE_ENV),
};
