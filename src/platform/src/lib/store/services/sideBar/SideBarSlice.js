import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isCollapsed: false,
  toggleDrawer: false,
  toggleGlobalDrawer: false,
  // New separate state for global topbar sidebar
  isGlobalSidebarOpen: false,
  isGlobalDrawerOpen: false, // For mobile global drawer
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
    // New actions for global topbar sidebar (completely separate)
    setGlobalSidebarOpen: (state, action) => {
      state.isGlobalSidebarOpen = action.payload;
    },
    toggleGlobalSidebar: (state) => {
      state.isGlobalSidebarOpen = !state.isGlobalSidebarOpen;
    },
    setGlobalDrawerOpen: (state, action) => {
      state.isGlobalDrawerOpen = action.payload;
    },
    toggleGlobalDrawerMobile: (state) => {
      state.isGlobalDrawerOpen = !state.isGlobalDrawerOpen;
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
  // New global sidebar actions
  setGlobalSidebarOpen,
  toggleGlobalSidebar,
  setGlobalDrawerOpen,
  toggleGlobalDrawerMobile,
  resetSidebar,
} = sidebarSlice.actions;

export default sidebarSlice.reducer;
