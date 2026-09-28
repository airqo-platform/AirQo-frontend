import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UiState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  drawers: Record<string, boolean>;
  globalSidebarOpen: boolean;
}

const initialState: UiState = {
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  drawers: {},
  globalSidebarOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: state => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleMobileSidebar: state => {
      state.mobileSidebarOpen = !state.mobileSidebarOpen;
    },
    setMobileSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileSidebarOpen = action.payload;
    },
    openDrawer: (state, action: PayloadAction<string>) => {
      state.drawers[action.payload] = true;
    },
    closeDrawer: (state, action: PayloadAction<string>) => {
      state.drawers[action.payload] = false;
    },
    toggleDrawer: (state, action: PayloadAction<string>) => {
      state.drawers[action.payload] = !state.drawers[action.payload];
    },
    toggleGlobalSidebar: state => {
      state.globalSidebarOpen = !state.globalSidebarOpen;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleMobileSidebar,
  setMobileSidebarOpen,
  openDrawer,
  closeDrawer,
  toggleDrawer,
  toggleGlobalSidebar,
} = uiSlice.actions;
export default uiSlice.reducer;
