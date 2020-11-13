import {
  CREATE_POLYGON, EDIT_POLYGON,
  RENDER_MAP_DEFAULTS,
  RESET_MAP_DEFAULTS_SUCCESS,
} from "./types";

export const createPolygon = () => (dispatch) => {};

export const mapRenderDefaults = () => (dispatch) => {
  console.log("action called");
  dispatch({
    type: RENDER_MAP_DEFAULTS,
  });
};

export const resetMapState = () => dispatch => {
  dispatch({ type: RESET_MAP_DEFAULTS_SUCCESS });
}
