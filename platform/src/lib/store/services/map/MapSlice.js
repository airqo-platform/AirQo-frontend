import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  location: {
    country: '',
    city: '',
  },
  center: {
    latitude: 4.15,
    longitude: 23.12,
  },
  zoom: 2.88,
  showLocationDetails: false,
  selectedLocation: null,
  mapLoading: false,
  suggestedSites: [],
};

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
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
} = mapSlice.actions;
