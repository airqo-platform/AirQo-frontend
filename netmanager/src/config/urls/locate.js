import { stripTrailingSlash } from "../utils";

const BASE_LOCATE_URL = stripTrailingSlash(process.env.REACT_APP_BASE_LOCATE_URL || process.env.REACT_APP_BASE_URL);

export const RUN_LOCATE_MODEL = `${BASE_LOCATE_URL}/map/parishes`;

export const SAVE_LOCATE_MAP = `${BASE_LOCATE_URL}/map/savelocatemap`;

export const GET_LOCATE_MAP = `${BASE_LOCATE_URL}/map/getlocatemap/`;

export const UPDATE_LOCATE_MAP = `${BASE_LOCATE_URL}/map/updatelocatemap/`;

export const DELETE_LOCATE_MAP = `${BASE_LOCATE_URL}/map/deletelocatemap/`;
