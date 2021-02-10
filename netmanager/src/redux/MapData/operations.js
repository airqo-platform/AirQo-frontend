// for representing chained operations using redux-thunk
import {
  LOAD_PM25_HEATMAP_DATA_SUCCESS,
  LOAD_PM25_HEATMAP_DATA_FAILURE,
  LOAD_PM25_SENSOR_DATA_SUCCESS,
  LOAD_PM25_SENSOR_DATA_FAILURE,
} from "./actions";
import { heatmapPredictApi } from "views/apis/predict";
import { getMonitoringSitesInfoApi } from "views/apis/analytics";
import { transformDataToGeoJson } from "views/pages/Map/utils";

export const loadPM25HeatMapData = () => async (dispatch) => {
  return await heatmapPredictApi()
    .then((responseData) => {
      const payload = transformDataToGeoJson(responseData.data || [], {
        longitude: "longitude",
        latitude: "latitude",
      });
      dispatch({
        type: LOAD_PM25_HEATMAP_DATA_SUCCESS,
        payload,
      });
    })
    .catch(() => {
      dispatch({
        type: LOAD_PM25_HEATMAP_DATA_FAILURE,
      });
    });
};

export const loadPM25SensorData = () => async (dispatch) => {
  return await getMonitoringSitesInfoApi("")
    .then((responseData) => {
      const payload = transformDataToGeoJson(
        responseData.airquality_monitoring_sites,
        {
          longitude: "Longitude",
          latitude: "Latitude",
        }
      );
      dispatch({
        type: LOAD_PM25_SENSOR_DATA_SUCCESS,
        payload,
      });
    })
    .catch(() => {
      dispatch({
        type: LOAD_PM25_SENSOR_DATA_FAILURE,
      });
    });
};
