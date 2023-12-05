import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false
};

const HorizontalLoaderSlice = createSlice({
  name: 'HorizontalLoader',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const { setLoading } = HorizontalLoaderSlice.actions;

export default HorizontalLoaderSlice.reducer;
