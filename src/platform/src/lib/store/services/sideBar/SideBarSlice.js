import { createSlice } from '@reduxjs/toolkit';

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState: {
    isCollapsed: false,
    toggleDrawer: false,
    toggleGlobalDrawer: false,
  },
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
  },
});

export const {
  toggleSidebar,
  setSidebar,
  setToggleDrawer,
  toggleDrawer,
  setTogglingGlobalDrawer,
  toggleGlobalDrawer,
} = sidebarSlice.actions;

export default sidebarSlice.reducer;
