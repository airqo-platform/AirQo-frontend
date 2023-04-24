import { stripTrailingSlash } from '../utils';

const BASE_FAULT_DETECTION_URL = stripTrailingSlash(
  process.env.REACT_APP_BASE_FAULT_DETECTION_URL || process.env.REACT_APP_BASE_URL
);

export const GET_FAULTS = `${BASE_FAULT_DETECTION_URL}/get-faults`;
