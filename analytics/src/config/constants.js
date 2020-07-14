/* eslint-disable */
const devConfig = {
  VERIFY_TOKEN_URI: 'http://localhost:3000/api/v1/users/reset/you',
  UPDATE_PWD_URI: 'http://localhost:3000/api/v1/users/updatePasswordViaEmail',
  UPDATE_PWD_IN_URI: 'http://localhost:3000/api/v1/users/updatePassword',
  FORGOT_PWD_URI: 'http://localhost:3000/api/v1/users/forgotPassword',
  LOGIN_USER_URI: 'http://localhost:3000/api/v1/users/loginUser',
  REGISTER_USER_URI: 'http://localhost:3000/api/v1/users/registerUser',
  REGISTER_CANDIDATE_URI:
    'http://localhost:3000/api/v1/users/register/new/candidate',
  REJECT_USER_URI: 'http://localhost:3000/api/v1/users/deny',
  ACCEPT_USER_URI: 'http://localhost:3000/api/v1/users/accept',
  GET_USERS_URI: 'http://localhost:3000/api/v1/users/',
  GET_CANDIDATES_URI: 'http://localhost:3000/api/v1/users/candidates/fetch',
  DEFAULTS_URI: 'http://localhost:3000/api/v1/users/defaults',
  GENERATE_CUSTOMISABLE_CHARTS_URI: 'http://127.0.0.1:5000/api/v1/dashboard/customisedchart',
};
const testConfig = {
  VERIFY_TOKEN_URI: 'http://localhost:3000/api/v1/users/reset/you',
  UPDATE_PWD_URI: 'http://localhost:3000/api/v1/users/updatePasswordViaEmail',
  UPDATE_PWD_IN_URI: 'http://localhost:3000/api/v1/users/updatePassword',
  FORGOT_PWD_URI: 'http://localhost:3000/api/v1/users/forgotPassword',
  LOGIN_USER_URI: 'http://localhost:3000/api/v1/users/loginUser',
  REGISTER_USER_URI: 'http://localhost:3000/api/v1/users/registerUser',
  REGISTER_CANDIDATE_URI:
    'http://localhost:3000/api/v1/users/register/new/candidate',
  REJECT_USER_URI: 'http://localhost:3000/api/v1/users/deny',
  ACCEPT_USER_URI: 'http://localhost:3000/api/v1/users/accept',
  GET_USERS_URI: 'http://localhost:3000/api/v1/users/',
  GET_CANDIDATES_URI: 'http://localhost:3000/api/v1/users/candidates/fetch',
  DEFAULTS_URI: 'http://localhost:3000/api/v1/users/defaults'
};

const stageConfig = {
  VERIFY_TOKEN_URI:
    'https://airqo-250220.uc.r.appspot.com/api/v1/users/reset/you',
  UPDATE_PWD_URI:
    'https://airqo-250220.uc.r.appspot.com/api/v1/users/updatePasswordViaEmail',
  UPDATE_PWD_IN_URI:
    'https://airqo-250220.uc.r.appspot.com/api/v1/users/updatePassword',
  FORGOT_PWD_URI:
    'https://airqo-250220.uc.r.appspot.com/api/v1/users/forgotPassword',
  LOGIN_USER_URI:
    'https://airqo-250220.uc.r.appspot.com/api/v1/users/loginUser',
  REGISTER_USER_URI:
    'https://airqo-250220.uc.r.appspot.com/api/v1/users/registerUser',
  REGISTER_CANDIDATE_URI:
    'https://airqo-250220.uc.r.appspot.com/api/v1/users/register/new/candidate',
  REJECT_USER_URI: 'https://airqo-250220.uc.r.appspot.com/api/v1/users/deny',
  ACCEPT_USER_URI: 'https://airqo-250220.uc.r.appspot.com/api/v1/users/accept',
  GET_USERS_URI: 'https://airqo-250220.uc.r.appspot.com/api/v1/users/',
  GET_CANDIDATES_URI:
    'https://airqo-250220.uc.r.appspot.com/api/v1/users/candidates/fetch',
  DEFAULTS_URI: 'https://airqo-250220.uc.r.appspot.com/api/v1/users/defaults',
  GENERATE_CUSTOMISABLE_CHARTS_URI: 'https://analytcs-bknd-service-dot-airqo-250220.uc.r.appspot.com/api/v1/dashboard/customisedchart',
};
const prodConfig = {
  VERIFY_TOKEN_URI:
    'https://airqo-250220.uc.r.appspot.com/api/v1/users/reset/you',
  UPDATE_PWD_URI:
    'https://airqo-250220.uc.r.appspot.com/api/v1/users/updatePasswordViaEmail',
  UPDATE_PWD_IN_URI:
    'https://airqo-250220.uc.r.appspot.com/api/v1/users/updatePassword',
  FORGOT_PWD_URI:
    'https://airqo-250220.uc.r.appspot.com/api/v1/users/forgotPassword',
  LOGIN_USER_URI:
    'https://airqo-250220.uc.r.appspot.com/api/v1/users/loginUser',
  REGISTER_USER_URI:
    'https://airqo-250220.uc.r.appspot.com/api/v1/users/registerUser',
  REGISTER_CANDIDATE_URI:
    'https://airqo-250220.uc.r.appspot.com/api/v1/users/register/new/candidate',
  REJECT_USER_URI: 'https://airqo-250220.uc.r.appspot.com/api/v1/users/deny',
  ACCEPT_USER_URI: 'https://airqo-250220.uc.r.appspot.com/api/v1/users/accept',
  GET_USERS_URI: 'https://airqo-250220.uc.r.appspot.com/api/v1/users/',
  GET_CANDIDATES_URI:
    'https://airqo-250220.uc.r.appspot.com/api/v1/users/candidates/fetch',
  DEFAULTS_URI: 'https://airqo-250220.uc.r.appspot.com/api/v1/users/defaults',
  GENERATE_CUSTOMISABLE_CHARTS_URI: 'https://analytcs-bknd-service-dot-airqo-250220.uc.r.appspot.com/api/v1/dashboard/customisedchart',
};
const defaultConfig = {
  PORT: process.env.PORT || 5000,
  NODE_PATH: process.env.NODE_PATH || 'src'
};

function envConfig(env) {
  switch (env) {
    case 'development':
      return devConfig;
    case 'test':
      return stageConfig;
    case 'stage':
      return stageConfig;
    default:
      return prodConfig;
  }
}

export default {
  ...defaultConfig,
  ...envConfig(process.env.NODE_ENV)
};
