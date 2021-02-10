import {
  LOAD_PM25_HEATMAP_DATA_SUCCESS,
  LOAD_PM25_SENSOR_DATA_SUCCESS,
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
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_PM25_HEATMAP_DATA_SUCCESS:
      return { ...state, pm25HeatMapData: action.payload };
    case LOAD_PM25_SENSOR_DATA_SUCCESS:
      return { ...state, pm25SensorData: action.payload };

    default:
      return state;
  }
}
