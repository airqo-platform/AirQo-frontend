import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  organizationTheme: null,
  isLoading: false,
  error: null,
  hasData: false,
};

export const organizationThemeSlice = createSlice({
  name: 'organizationTheme',
  initialState,
  reducers: {
    setOrganizationTheme: (state, action) => {
      state.organizationTheme = action.payload;
      state.hasData = !!action.payload;
      state.error = null;
    },
    setOrganizationThemeLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setOrganizationThemeError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearOrganizationTheme: (state) => {
      state.organizationTheme = null;
      state.hasData = false;
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase({ type: 'RESET_APP' }, () => initialState)
      .addCase({ type: 'LOGOUT_USER' }, () => initialState);
  },
});

export const {
  setOrganizationTheme,
  setOrganizationThemeLoading,
  setOrganizationThemeError,
  clearOrganizationTheme,
} = organizationThemeSlice.actions;

export default organizationThemeSlice.reducer;
