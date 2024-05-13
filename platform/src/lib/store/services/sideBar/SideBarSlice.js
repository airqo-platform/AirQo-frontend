import { createSlice } from '@reduxjs/toolkit';

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState: {
    isCollapsed: false,
    toggleDrawer: false,
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
  },
});

export const { toggleSidebar, setSidebar, setToggleDrawer, toggleDrawer } = sidebarSlice.actions;

export default sidebarSlice.reducer;
