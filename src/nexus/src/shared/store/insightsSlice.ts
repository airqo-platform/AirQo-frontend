import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DialogItem {
  id: string;
  type: 'more-insights' | 'add-location';
  data?: Record<string, unknown>;
}

export interface SelectedSite {
  _id: string;
  name: string;
  search_name?: string;
  country?: string;
  city?: string;
  region?: string;
  device_name?: string;
}

export interface InsightsState {
  // Dialog stack for navigation (supports multiple dialogs)
  dialogStack: DialogItem[];

  // Selected sites for insights
  selectedSites: SelectedSite[];

  // Loading states
  isLoading: boolean;
  error: string | null;
}

const initialState: InsightsState = {
  dialogStack: [],
  selectedSites: [],
  isLoading: false,
  error: null,
};

const insightsSlice = createSlice({
  name: 'insights',
  initialState,
  reducers: {
    // Dialog stack management
    openDialog: (state, action: PayloadAction<DialogItem>) => {
      // Check if dialog is already in stack
      const existingIndex = state.dialogStack.findIndex(
        item =>
          item.id === action.payload.id && item.type === action.payload.type
      );

      if (existingIndex === -1) {
        // Add to stack if not exists
        state.dialogStack.push(action.payload);
      } else {
        // Move to top if exists
        const [dialog] = state.dialogStack.splice(existingIndex, 1);
        state.dialogStack.push(dialog);
      }
    },

    closeDialog: (state, action: PayloadAction<string>) => {
      // Remove specific dialog from stack
      state.dialogStack = state.dialogStack.filter(
        item => item.id !== action.payload
      );
    },

    closeTopDialog: state => {
      // Remove the top dialog from stack
      state.dialogStack.pop();
    },

    closeAllDialogs: state => {
      state.dialogStack = [];
    },

    // Selected sites management
    setSelectedSites: (state, action: PayloadAction<SelectedSite[]>) => {
      state.selectedSites = action.payload;
    },

    addSelectedSite: (state, action: PayloadAction<SelectedSite>) => {
      const exists = state.selectedSites.some(
        site => site._id === action.payload._id
      );
      if (!exists) {
        state.selectedSites.push(action.payload);
      }
    },

    removeSelectedSite: (state, action: PayloadAction<string>) => {
      state.selectedSites = state.selectedSites.filter(
        site => site._id !== action.payload
      );
    },

    toggleSelectedSite: (state, action: PayloadAction<SelectedSite>) => {
      const exists = state.selectedSites.some(
        site => site._id === action.payload._id
      );
      if (exists) {
        state.selectedSites = state.selectedSites.filter(
          site => site._id !== action.payload._id
        );
      } else {
        state.selectedSites.push(action.payload);
      }
    },

    clearSelectedSites: state => {
      state.selectedSites = [];
    },

    // Loading and error states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Convenience actions
    openMoreInsights: (
      state,
      action: PayloadAction<{ sites: SelectedSite[] }>
    ) => {
      state.selectedSites = action.payload.sites;
      state.dialogStack.push({
        id: 'more-insights',
        type: 'more-insights',
      });
    },

    openAddLocation: state => {
      state.dialogStack.push({
        id: 'add-location',
        type: 'add-location',
      });
    },
  },
});

export const {
  openDialog,
  closeDialog,
  closeTopDialog,
  closeAllDialogs,
  setSelectedSites,
  addSelectedSite,
  removeSelectedSite,
  toggleSelectedSite,
  clearSelectedSites,
  setLoading,
  setError,
  openMoreInsights,
  openAddLocation,
} = insightsSlice.actions;

export default insightsSlice.reducer;
