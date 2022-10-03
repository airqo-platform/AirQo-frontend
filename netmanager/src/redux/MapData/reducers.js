import { LOGOUT_USER_SUCCESS } from "redux/Join/types";
import {
  LOAD_PM25_HEATMAP_DATA_SUCCESS,
  LOAD_PM25_SENSOR_DATA_SUCCESS,
  LOAD_MAP_EVENTS_SUCCESS,
  LOAD_MAP_SENSORS_DATA_SUCCESS,
} from "./actions";
import { transformDataToGeoJson } from "views/pages/Map/utils";

const initialState = {
  pm25HeatMapData: transformDataToGeoJson([], {
    longitude: "longitude",
    latitude: "latitude",
  }),
  pm25SensorData: transformDataToGeoJson([], {
    longitude: "Longitude",
    latitude: "Latitude",
  }),
  eventsData: transformDataToGeoJson([], {
    longitude: "Longitude",
    latitude: "Latitude",
  }),
  sensorsData: [],
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOGOUT_USER_SUCCESS:
      return initialState;

    case LOAD_PM25_HEATMAP_DATA_SUCCESS:
      return { ...state, pm25HeatMapData: action.payload };

    case LOAD_PM25_SENSOR_DATA_SUCCESS:
      return { ...state, pm25SensorData: action.payload };

    case LOAD_MAP_EVENTS_SUCCESS:
      return { ...state, eventsData: action.payload };

    case LOAD_MAP_SENSORS_DATA_SUCCESS:
      return { ...state, sensorsData: action.payload };

    default:
      return state;
  }
}
