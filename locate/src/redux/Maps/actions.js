import { CREATE_POLYGON, EDIT_POLYGON, RENDER_MAP_DEFAULTS } from "./types";

export const createPolygon = () => (dispatch) => {};

export const mapRenderDefaults = () => (dispatch) => {
  console.log("action called");
  dispatch({
    type: RENDER_MAP_DEFAULTS,
  });
};
