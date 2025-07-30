import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedSites: [], // Sites selected for More Insights view
  tempSelectedSites: [], // Temporary selections while in Add Location modal
  isAddingLocations: false, // Flag to track if user is in add location mode
  lastUpdate: null, // Timestamp of last update for cache invalidation
};

const moreInsightsSlice = createSlice({
  name: 'moreInsights',
  initialState,
  reducers: {
    // Set the initial selected sites for More Insights
    setMoreInsightsSites: (state, action) => {
      state.selectedSites = Array.isArray(action.payload) ? action.payload : [];
      state.lastUpdate = Date.now();
    },

    // Add a site to More Insights selection
    addMoreInsightsSite: (state, action) => {
      const site = action.payload;
      if (
        site &&
        site._id &&
        !state.selectedSites.some((s) => s._id === site._id)
      ) {
        state.selectedSites.push(site);
        state.lastUpdate = Date.now();
      }
    },

    // Remove a site from More Insights selection
    removeMoreInsightsSite: (state, action) => {
      const siteId = action.payload;
      state.selectedSites = state.selectedSites.filter((s) => s._id !== siteId);
      state.lastUpdate = Date.now();
    },

    // Toggle a site in More Insights selection
    toggleMoreInsightsSite: (state, action) => {
      const site = action.payload;
      if (!site || !site._id) return;

      const exists = state.selectedSites.some((s) => s._id === site._id);
      if (exists) {
        // Only allow removal if more than one site exists
        if (state.selectedSites.length > 1) {
          state.selectedSites = state.selectedSites.filter(
            (s) => s._id !== site._id,
          );
          state.lastUpdate = Date.now();
        }
      } else {
        state.selectedSites.push(site);
        state.lastUpdate = Date.now();
      }
    },

    // Set temporary selections while in Add Location modal
    setTempSelectedSites: (state, action) => {
      state.tempSelectedSites = Array.isArray(action.payload)
        ? action.payload
        : [];
    },

    // Apply temporary selections to actual selections
    applyTempSelections: (state) => {
      if (state.tempSelectedSites.length > 0) {
        state.selectedSites = [...state.tempSelectedSites];
        state.lastUpdate = Date.now();
      }
      state.tempSelectedSites = [];
      state.isAddingLocations = false;
    },

    // Cancel temporary selections and revert
    cancelTempSelections: (state) => {
      state.tempSelectedSites = [];
      state.isAddingLocations = false;
    },

    // Set the add locations mode flag
    setIsAddingLocations: (state, action) => {
      state.isAddingLocations = action.payload;
      if (action.payload) {
        // Initialize temp selections with current selections
        state.tempSelectedSites = [...state.selectedSites];
      }
    },

    // Clear all More Insights data
    clearMoreInsightsData: (state) => {
      state.selectedSites = [];
      state.tempSelectedSites = [];
      state.isAddingLocations = false;
      state.lastUpdate = Date.now();
    },

    // Update multiple sites at once (for bulk operations)
    updateMoreInsightsSites: (state, action) => {
      const { add = [], remove = [] } = action.payload;

      // Add new sites
      add.forEach((site) => {
        if (
          site &&
          site._id &&
          !state.selectedSites.some((s) => s._id === site._id)
        ) {
          state.selectedSites.push(site);
        }
      });

      // Remove sites
      if (remove.length > 0) {
        const removeIds = remove.map((s) => s._id || s);
        state.selectedSites = state.selectedSites.filter(
          (s) => !removeIds.includes(s._id),
        );
      }

      state.lastUpdate = Date.now();
    },
  },
});

export const {
  setMoreInsightsSites,
  addMoreInsightsSite,
  removeMoreInsightsSite,
  toggleMoreInsightsSite,
  setTempSelectedSites,
  applyTempSelections,
  cancelTempSelections,
  setIsAddingLocations,
  clearMoreInsightsData,
  updateMoreInsightsSites,
} = moreInsightsSlice.actions;

export default moreInsightsSlice.reducer;

// Selectors
export const selectMoreInsightsSites = (state) =>
  state.moreInsights.selectedSites;
export const selectTempSelectedSites = (state) =>
  state.moreInsights.tempSelectedSites;
export const selectIsAddingLocations = (state) =>
  state.moreInsights.isAddingLocations;
export const selectMoreInsightsLastUpdate = (state) =>
  state.moreInsights.lastUpdate;
