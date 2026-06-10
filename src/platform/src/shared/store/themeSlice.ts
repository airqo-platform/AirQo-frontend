import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ThemeState {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  interfaceStyle: 'default' | 'bordered';
  contentLayout: 'compact' | 'wide';
}

const initialState: ThemeState = {
  mode: 'system',
  primaryColor: '#1649e5',
  interfaceStyle: 'default',
  contentLayout: 'wide',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (
      state,
      action: PayloadAction<'light' | 'dark' | 'system'>
    ) => {
      state.mode = action.payload;
    },
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.primaryColor = action.payload;
    },
    setInterfaceStyle: (
      state,
      action: PayloadAction<'default' | 'bordered'>
    ) => {
      state.interfaceStyle = action.payload;
    },
    setContentLayout: (state, action: PayloadAction<'compact' | 'wide'>) => {
      state.contentLayout = action.payload;
    },
  },
});

export const {
  setThemeMode,
  setPrimaryColor,
  setInterfaceStyle,
  setContentLayout,
} = themeSlice.actions;
export default themeSlice.reducer;
