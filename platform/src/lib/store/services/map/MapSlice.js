import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const initialState = {
  center: {
    latitude: 0.3201412790664193,
    longitude: 32.56389785939493,
  },
  zoom: 13,
};

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setCenter: (state, action) => {
      state.center = action.payload;
    },
    setZoom: (state, action) => {
      state.zoom = action.payload;
    },
  },
});

export const { setCenter, setZoom } = mapSlice.actions;
