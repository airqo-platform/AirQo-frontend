import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getUserPreferencesApi,
  updateUserPreferencesApi,
  postUserPreferencesApi,
  patchUserPreferencesApi,
  postUserDefaultsApi,
} from '@/core/apis/Account';
import { WritableDraft } from 'immer';

const initialState = {
  locationsData: {},
  success: false,
  errors: null,
  update_response: [],
  post_response: [],
  individual_preferences: [],
};

// Async actions using createAsyncThunk
export const postUserPreferences = createAsyncThunk(
  'preferences/post', // Updated action type
  async (data, { rejectWithValue }) => {
    try {
      const response = await postUserPreferencesApi(data);
      return response;
    } catch (error) {
      return rejectWithValue(
        (error as any).response ? (error as any).response.data : { message: (error as any).message },
      );
    }
  },
);

export const updateUserPreferences = createAsyncThunk(
  'preferences/update',
  async (data, { rejectWithValue }) => {
    try {
      const response = await updateUserPreferencesApi(data);
      return response;
    } catch (error) {
      return rejectWithValue(
        (error as any).response ? (error as any).response.data : { message: (error as any).message },
      );
    }
  },
);

export const getIndividualUserPreferences = createAsyncThunk(
  'preferences/getIndividual',
  async ({ identifier, groupID = null }: { identifier: string; groupID?:  null }, { rejectWithValue }) => {
    try {
      const response = await getUserPreferencesApi(identifier, groupID);
      return response;
    } catch (error) {
      return rejectWithValue(
        (error as any).response ? (error as any).response.data : { message: (error as any).message },
      );
    }
  },
);

export const replaceUserPreferences = createAsyncThunk(
  'preferences/replace',
  async (data, { rejectWithValue }) => {
    try {
      const response = await patchUserPreferencesApi(data);
      return response;
    } catch (error) {
      return rejectWithValue(
        (error as any).response ? (error as any).response.data : { message: (error as any).message },
      );
    }
  },
);

export const postUserDefaults = createAsyncThunk(
  'preferences/postDefaults',
  async (data, { rejectWithValue }) => {
    try {
      const response = await postUserDefaultsApi(data);
      return response;
    } catch (error) {
      return rejectWithValue(
        (error as any).response ? (error as any).response.data : { message: (error as any).message },
      );
    }
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
    const handlePending = (state: WritableDraft<{ locationsData: {}; success: boolean; errors: null; update_response: never[]; post_response: never[]; individual_preferences: never[]; }>) => {
      state.success = false;
      state.errors = null;
    };
    const handleRejected = (
        state: { errors: any; success: boolean },
        action: { payload?: { message: any }; error: { message: any } }
      ) => {
        state.errors =
          action.payload && typeof action.payload === "object" && "message" in action.payload
            ? action.payload.message
            : action.error.message;
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
      .addCase(replaceUserPreferences.rejected, handleRejected);
  },
});

export const { setCustomisedLocations, clearIndividualPreferences } =
  defaultsSlice.actions;
export default defaultsSlice.reducer;
