import { createSlice } from '@reduxjs/toolkit';
import i18n from 'i18next';

export const navigationSlice = createSlice({
  name: 'navBarTab',
  initialState: {
    tab: i18n.t('about.events.navTabs.upcoming'),
    languageTab: 'en'
  },
  reducers: {
    setNavTab: (state, action) => {
      state.tab = action.payload;
    },
    setLanguageTab: (state, action) => {
      state.languageTab = action.payload;
    }
  }
});

export const { setNavTab, setLanguageTab } = navigationSlice.actions;

export default navigationSlice.reducer;
