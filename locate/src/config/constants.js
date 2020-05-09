const constants = {
  VERIFY_TOKEN_URI: "https://airqo-250220.uc.r.appspot.com/api/v1/users/reset",
  UPDATE_PWD_URI:
    "https://airqo-250220.uc.r.appspot.com/api/v1/users/updatePasswordViaEmail",
  FORGOT_PWD_URI:
    "https://airqo-250220.uc.r.appspot.com/api/v1/users/forgotPassword",
  LOGIN_USER_URI:
    "https://airqo-250220.uc.r.appspot.com/api/v1/users/loginUser",
  REGISTER_USER_URI:
    "https://airqo-250220.uc.r.appspot.com/api/v1/users/registerUser",
  REGISTER_CANDIDATE_URI:
    "https://airqo-250220.uc.r.appspot.com/api/v1/users/registerCandidate",
  REJECT_USER_URI: "https://airqo-250220.uc.r.appspot.com/api/v1/users/deny",
  ACCEPT_USER_URI: "https://airqo-250220.uc.r.appspot.com/api/v1/users/accept",
  GET_USERS_URI: "https://airqo-250220.uc.r.appspot.com/api/v1/users/",
  SAVE_LOCATE_MAP: "http://localhost:4000/api/v1/map/savelocatemap",
  GET_LOCATE_MAP: "http://localhost:4000/api/v1/map/getlocatemap/",
  RUN_LOCATE_MODEL: "http://127.0.0.1:4000/api/v1/map/parishes",
};

export default constants;
