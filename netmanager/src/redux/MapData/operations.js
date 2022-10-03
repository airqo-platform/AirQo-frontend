// for representing chained operations using redux-thunk
import {
  LOAD_PM25_HEATMAP_DATA_SUCCESS,
  LOAD_PM25_HEATMAP_DATA_FAILURE,
  LOAD_PM25_SENSOR_DATA_SUCCESS,
  LOAD_PM25_SENSOR_DATA_FAILURE,
  LOAD_MAP_EVENTS_SUCCESS,
  LOAD_MAP_EVENTS_FAILURE,
  LOAD_MAP_SENSORS_DATA_SUCCESS,
  LOAD_MAP_SENSORS_DATA_FAILURE,
} from "./actions";
import { heatmapPredictApi } from "views/apis/predict";
import {
  getMonitoringSitesInfoApi,
  getLatestAirQualityApi,
} from "views/apis/analytics";
import { transformDataToGeoJson } from "views/pages/Map/utils";
import { getEventsApi } from "views/apis/deviceRegistry";

export const loadPM25HeatMapData = () => async (dispatch) => {
  return await heatmapPredictApi()
    .then((responseData) => {
      const res = responseData.data.map((airqloud) => airqloud.values);
      const heatMapValues = res[0].map((value) => value);
      const payload = transformDataToGeoJson(
        heatMapValues || [],
        {
          latitude: "latitude",
          longitude: "longitude",
        },
        undefined,
        (feature) => feature
      );
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

export const loadMapSensorsData = () => async (dispatch) => {
  return await getLatestAirQualityApi()
    .then((responseData) => {
      const payload = responseData.data;

      dispatch({
        type: LOAD_MAP_SENSORS_DATA_SUCCESS,
        payload,
      });
    })
    .catch(() => {
      dispatch({
        type: LOAD_MAP_SENSORS_DATA_FAILURE,
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

export const loadMapEventsData = (params) => async (dispatch) => {
  return await getEventsApi(params)
    .then((responseData) => {
      const payload = transformDataToGeoJson(
        responseData.measurements,
        {
          longitude: "Longitude",
          latitude: "Latitude",
        },
        (feature) => [
          (feature.deviceDetails && feature.deviceDetails.longitude) ||
            (feature.location &&
              feature.location.longitude &&
              feature.location.longitude.value),
          (feature.deviceDetails && feature.deviceDetails.latitude) ||
            (feature.location &&
              feature.location.latitude &&
              feature.location.latitude.value),
        ]
      );

      dispatch({
        type: LOAD_MAP_EVENTS_SUCCESS,
        payload,
      });
    })
    .catch(() => {
      dispatch({
        type: LOAD_MAP_EVENTS_FAILURE,
      });
    });
};
