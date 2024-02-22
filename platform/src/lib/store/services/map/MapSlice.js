import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  location: {
    country: '',
    city: '',
  },
  center: {
    latitude: 0.3201412790664193,
    longitude: 32.56389785939493,
  },
  zoom: 12,
};

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setCenter: (state, action) => {
      if (action.payload && action.payload.latitude && action.payload.longitude) {
        state.center = action.payload;
      }
    },
    setZoom: (state, action) => {
      if (action.payload && typeof action.payload === 'number') {
        state.zoom = action.payload;
      }
    },
    setLocation: (state, action) => {
      // Reset the location state
      state.location = { country: '', city: '' };

      if (action.payload) {
        if (action.payload.country) {
          state.location.country = action.payload.country;
        }
        if (action.payload.city) {
          state.location.city = action.payload.city;
        }
      }
    },
  },
});

export const { setCenter, setZoom, setLocation } = mapSlice.actions;
