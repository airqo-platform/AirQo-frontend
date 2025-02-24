import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  location: {
    country: '',
    city: '',
  },
  center: {
    latitude: 9.7037,
    longitude: 19.9573,
  },
  zoom: 3.27,
  showLocationDetails: false,
  selectedLocation: null,
  mapLoading: false,
  suggestedSites: [],
  selectedNode: null,
  selectedWeeklyPrediction: null,
  mapReadingsData: [],
  waqData: [],
};

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setSelectedWeeklyPrediction: (state, action) => {
      state.selectedWeeklyPrediction = action.payload;
    },
    setSelectedNode: (state, action) => {
      state.selectedNode = action.payload;
    },
    setCenter: (state, action) => {
      const { latitude, longitude } = action.payload || {};
      if (latitude && longitude) {
        state.center = { ...state.center, latitude, longitude };
      }
    },
    setZoom: (state, action) => {
      if (typeof action.payload === 'number') {
        state.zoom = action.payload;
      }
    },
    setLocation: (state, action) => {
      const { country = '', city = '' } = action.payload || {};
      state.location = { country, city };
    },
    clearData: (state) => {
      return initialState;
    },
    reSetMap: (state) => {
      state.center = initialState.center;
      state.zoom = initialState.zoom;
      state.location = initialState.location;
    },
    setOpenLocationDetails: (state, action) => {
      state.showLocationDetails = action.payload;
    },
    setSelectedLocation: (state, action) => {
      state.selectedLocation = action.payload;
    },
    setMapLoading: (state, action) => {
      state.mapLoading = action.payload;
    },
    addSuggestedSites: (state, action) => {
      state.suggestedSites = action.payload;
    },
    setMapReadingsData: (state, action) => {
      state.mapReadingsData = action.payload;
    },
    setWaqData: (state, action) => {
      state.waqData = action.payload;
    },
  },
});

export const {
  setCenter,
  setZoom,
  setLocation,
  clearData,
  setOpenLocationDetails,
  setSelectedLocation,
  setMapLoading,
  addSuggestedSites,
  setSelectedNode,
  reSetMap,
  setSelectedWeeklyPrediction,
  setMapReadingsData,
  setWaqData,
} = mapSlice.actions;
