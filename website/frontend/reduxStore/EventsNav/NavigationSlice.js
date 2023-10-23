import { createSlice } from '@reduxjs/toolkit';

export const navigationSlice = createSlice({
  name: 'navBarTab',
  initialState: {
    tab: 'upcoming events',
    languageTab: 'English'
  },
  reducers: {
    setNavTab: (state, action) => {
      state.tab = action.payload;
    },
    setLanguageTab: (state, action)=>{
      state.languageTab = action.payload
    }
  }
});

export const { setNavTab, setLanguageTab } = navigationSlice.actions;

export default navigationSlice.reducer;
