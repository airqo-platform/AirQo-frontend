import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isCollapsed: false,
  toggleDrawer: false,
  toggleGlobalDrawer: false,
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isCollapsed = !state.isCollapsed;
    },
    setSidebar: (state, action) => {
      state.isCollapsed = action.payload;
    },
    setToggleDrawer: (state, action) => {
      state.toggleDrawer = action.payload;
    },
    toggleDrawer: (state) => {
      state.toggleDrawer = !state.toggleDrawer;
    },
    setTogglingGlobalDrawer: (state, action) => {
      state.toggleGlobalDrawer = action.payload;
    },
    toggleGlobalDrawer: (state) => {
      state.toggleGlobalDrawer = !state.toggleGlobalDrawer;
    },
    resetSidebar: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase({ type: 'RESET_APP' }, () => initialState)
      .addCase({ type: 'LOGOUT_USER' }, () => initialState);
  },
});

export const {
  toggleSidebar,
  setSidebar,
  setToggleDrawer,
  toggleDrawer,
  setTogglingGlobalDrawer,
  toggleGlobalDrawer,
  resetSidebar,
} = sidebarSlice.actions;

export default sidebarSlice.reducer;
