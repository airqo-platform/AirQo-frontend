import { useSelector } from "react-redux";

export const usePM25HeatMapData = () => {
  return useSelector((state) => state.mapData.pm25HeatMapData);
};

export const usePM25SensorData = () => {
  return useSelector((state) => state.mapData.pm25SensorData);
};

export const useEventsMapData = () => {
  return useSelector((state) => state.mapData.eventsData);
};

export const useMapSensorsData = () => {
  return useSelector((state) => state.mapData.sensorsData);
};
