import { stripTrailingSlash } from "../utils";

const BASE_LOCATE_URL = stripTrailingSlash(process.env.REACT_APP_BASE_LOCATE_URL || process.env.REACT_APP_BASE_URL);

export const RUN_LOCATE_MODEL = `${BASE_LOCATE_URL}/locate/map/parishes`;

export const SAVE_LOCATE_MAP = `${BASE_LOCATE_URL}/locate/map/create`;

export const GET_LOCATE_MAP = `${BASE_LOCATE_URL}/locate/map/get`;

export const UPDATE_LOCATE_MAP = `${BASE_LOCATE_URL}/locate/map/update`;

export const DELETE_LOCATE_MAP = `${BASE_LOCATE_URL}/locate/map/delete`;
