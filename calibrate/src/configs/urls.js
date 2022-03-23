import { stripTrailingSlash } from "./utils";

const BASE_CALIBRATE_URL = stripTrailingSlash(
  process.env.REACT_APP_BASE_CALIBRATE_URL || process.env.REACT_APP_BASE_URL
);
