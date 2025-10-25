import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UiState {
  sidebarCollapsed: boolean;
  drawers: Record<string, boolean>;
}

const initialState: UiState = {
  sidebarCollapsed: false,
  drawers: {},
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
    openDrawer: (state, action: PayloadAction<string>) => {
      state.drawers[action.payload] = true;
    },
    closeDrawer: (state, action: PayloadAction<string>) => {
      state.drawers[action.payload] = false;
    },
    toggleDrawer: (state, action: PayloadAction<string>) => {
      state.drawers[action.payload] = !state.drawers[action.payload];
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  openDrawer,
  closeDrawer,
  toggleDrawer,
} = uiSlice.actions;
export default uiSlice.reducer;
