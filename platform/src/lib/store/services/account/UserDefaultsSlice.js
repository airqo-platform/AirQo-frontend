import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getSiteSummaryDetails, getGridLocationDetails } from '@/core/apis/DeviceRegistry';

const initialState = {
  locationsData: {},
  success: false,
  errors: null,
  update_response: [],
  post_response: [],
  individual_preferences: [],
};

export const postUserPreferences = createAsyncThunk(
  '/post/preferences',
  async (data, { rejectWithValue }) => {
    try {
      const response = await postUserPreferencesApi(data);
      return response;
    } catch (error) {
      if (!error.response) {
        throw error;
      }
      return rejectWithValue(error.response.data);
    }
  },
);

export const updateUserPreferences = createAsyncThunk(
  '/update/preferences',
  async (data, { rejectWithValue }) => {
    try {
      const response = await updateUserPreferencesApi(data);
      return response;
    } catch (error) {
      if (!error.response) {
        throw error;
      }
      return rejectWithValue(error.response.data);
    }
  },
);

export const getIndividualUserPreferences = createAsyncThunk(
  '/get/individual/preference',
  async (identifier, { rejectWithValue }) => {
    try {
      const response = await getUserPreferencesApi(identifier);
      return response;
    } catch (error) {
      if (!error.response) {
        throw error;
      }
      return rejectWithValue(error.response.data);
    }
  },
);

export const replaceUserPreferences = createAsyncThunk(
  '/replace/individual/preference',
  async (data, { rejectWithValue }) => {
    try {
      const response = await patchUserPreferencesApi(data);
      return response;
    } catch (error) {
      if (!error.response) {
        throw error;
      }
      return rejectWithValue(error.response.data);
    }
  },
);

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
    builder
      .addCase(postUserPreferences.pending, (state) => {
        state.success = false;
        state.errors = null;
        state.post_response = [];
      })
      .addCase(postUserPreferences.fulfilled, (state, action) => {
        state.post_response = action.payload;
        state.success = action.payload.success;
      })
      .addCase(postUserPreferences.rejected, (state, action) => {
        state.errors = action.error.message;
        state.success = false;
      })
      .addCase(updateUserPreferences.pending, (state) => {
        state.success = false;
        state.errors = null;
        state.update_response = [];
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.update_response = action.payload;
        state.success = action.payload.success;
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.errors = action.error.message;
        state.success = false;
      })
      .addCase(getIndividualUserPreferences.pending, (state) => {
        state.success = false;
        state.errors = null;
        state.individual_preferences = [];
      })
      .addCase(getIndividualUserPreferences.fulfilled, (state, action) => {
        state.individual_preferences = action.payload.preferences;
        state.success = action.payload.success;
      })
      .addCase(getIndividualUserPreferences.rejected, (state, action) => {
        state.errors = action.error.message;
        state.success = false;
      })
      .addCase(replaceUserPreferences.pending, (state) => {
        state.success = false;
        state.errors = null;
      })
      .addCase(replaceUserPreferences.fulfilled, (state, action) => {
        state.individual_preferences = action.payload.preferences;
        state.success = action.payload.success;
      })
      .addCase(replaceUserPreferences.rejected, (state, action) => {
        state.errors = action.error.message;
        state.success = false;
      });
  },
});

export const { setCustomisedLocations, clearIndividualPreferences } = defaultsSlice.actions;
export default defaultsSlice.reducer;
