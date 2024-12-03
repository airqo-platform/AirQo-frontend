import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  refresh: false
};

const HorizontalLoaderSlice = createSlice({
  name: 'HorizontalLoader',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setRefresh: (state, action) => {
      state.refresh = action.payload;
    }
  }
});

export const { setLoading, setRefresh } = HorizontalLoaderSlice.actions;

export default HorizontalLoaderSlice.reducer;
