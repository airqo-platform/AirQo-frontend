import { useSelector } from 'react-redux';

export const usePM25HeatMapData = () => {
  return useSelector((state) =>
    state.mapData && state.mapData.pm25HeatMapData ? state.mapData.pm25HeatMapData : undefined
  );
};

export const useEventsMapData = () => {
  return useSelector((state) =>
    state.mapData && state.mapData.eventsData ? state.mapData.eventsData : undefined
  );
};
