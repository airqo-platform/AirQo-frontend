import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  location: {
    country: '',
    city: '',
  },
  center: {
    latitude: 2.5768,
    longitude: 25.1601,
  },
  zoom: 3.01,
  showLocationDetails: false,
  selectedLocation: null,
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
  },
});

export const {
  setCenter,
  setZoom,
  setLocation,
  clearData,
  setOpenLocationDetails,
  setSelectedLocation,
} = mapSlice.actions;
