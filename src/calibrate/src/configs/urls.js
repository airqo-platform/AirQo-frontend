import { stripTrailingSlash } from "./utils";

const BASE_CALIBRATE_URL = stripTrailingSlash(
  process.env.REACT_APP_BASE_CALIBRATE_URL || process.env.REACT_APP_BASE_URL
);

export const CALIBRATE_TOOL_URL = `${BASE_CALIBRATE_URL}/calibrate/tool`;

export const TRAIN_CALIBRATE_TOOL_URL = `${BASE_CALIBRATE_URL}/calibrate/tool/train`;
