import { useSelector } from "react-redux";

export const usePM25HeatMapData = () => {
  return useSelector((state) => state.mapData.pm25HeatMapData);
};

export const usePM25SensorData = () => {
  return useSelector((state) => state.mapData.pm25SensorData);
};
