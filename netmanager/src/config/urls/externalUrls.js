import { stripTrailingSlash } from "../utils";

export const CALIBRATE_APP_URL = stripTrailingSlash(
  process.env.REACT_APP_CALIBRATE_APP_URL || "https://airqalibrate.airqo.net/"
);
