import { createSlice } from '@reduxjs/toolkit';

export const navigationSlice = createSlice({
  name: 'navBarTab',
  initialState: {
    tab: 'upcoming events'
  },
  reducers: {
    setNavTab: (state, action) => {
      state.tab = action.payload;
    }
  }
});

export const { setNavTab } = navigationSlice.actions;

export default navigationSlice.reducer;
