import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getUserPreferencesApi,
  updateUserPreferencesApi,
  postUserPreferencesApi,
  patchUserPreferencesApi,
  postUserDefaultsApi,
} from '@/core/apis/Account';

const initialState = {
  locationsData: {},
  success: false,
  errors: null,
  update_response: [],
  post_response: [],
  individual_preferences: [],
};

// Simplified async thunks
export const postUserPreferences = createAsyncThunk(
  'preferences/post',
  async (data) => {
    return postUserPreferencesApi(data);
  },
);

export const updateUserPreferences = createAsyncThunk(
  'preferences/update',
  async (data) => {
    return updateUserPreferencesApi(data);
  },
);

export const getIndividualUserPreferences = createAsyncThunk(
  'preferences/getIndividual',
  async ({ identifier, groupID = null }) => {
    return getUserPreferencesApi(identifier, groupID);
  },
);

export const replaceUserPreferences = createAsyncThunk(
  'preferences/replace',
  async (data) => {
    return patchUserPreferencesApi(data);
  },
);

export const postUserDefaults = createAsyncThunk(
  'preferences/postDefaults',
  async (data) => {
    return postUserDefaultsApi(data);
  },
);

// Create Slice
export const defaultsSlice = createSlice({
  name: 'defaults',
  initialState,
  reducers: {
    setCustomisedLocations: (state, action) => {
      state.locationsData = action.payload;
    },
    clearIndividualPreferences: (state) => {
      state.individual_preferences = [];
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => {
      state.success = false;
      state.errors = null;
    };

    const handleRejected = (state, action) => {
      state.errors = action.error.message;
      state.success = false;
    };

    builder
      // Post user preferences
      .addCase(postUserPreferences.pending, (state) => {
        handlePending(state);
        state.post_response = [];
      })
      .addCase(postUserPreferences.fulfilled, (state, action) => {
        state.post_response = action.payload;
        state.success = true;
      })
      .addCase(postUserPreferences.rejected, handleRejected)

      // Update user preferences
      .addCase(updateUserPreferences.pending, (state) => {
        handlePending(state);
        state.update_response = [];
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.update_response = action.payload;
        state.success = true;
      })
      .addCase(updateUserPreferences.rejected, handleRejected)

      // Get individual user preferences
      .addCase(getIndividualUserPreferences.pending, (state) => {
        handlePending(state);
        state.individual_preferences = [];
      })
      .addCase(getIndividualUserPreferences.fulfilled, (state, action) => {
        state.individual_preferences = action.payload.preferences;
        state.success = true;
      })
      .addCase(getIndividualUserPreferences.rejected, handleRejected)

      // Replace user preferences
      .addCase(replaceUserPreferences.pending, handlePending)
      .addCase(replaceUserPreferences.fulfilled, (state, action) => {
        state.individual_preferences = action.payload.preferences;
        state.success = true;
      })
      .addCase(replaceUserPreferences.rejected, handleRejected)

      // Post user defaults
      .addCase(postUserDefaults.pending, handlePending)
      .addCase(postUserDefaults.fulfilled, (state) => {
        state.success = true;
      })
      .addCase(postUserDefaults.rejected, handleRejected);
  },
});

export const { setCustomisedLocations, clearIndividualPreferences } =
  defaultsSlice.actions;
export default defaultsSlice.reducer;
