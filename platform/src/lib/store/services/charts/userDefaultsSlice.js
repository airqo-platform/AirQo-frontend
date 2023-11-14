import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUserDefaults, updateUserDefaults, getUserPreferencesApi } from '@/core/apis/Account';

// Define action types to avoid typo errors
const actionTypes = {
  FETCH_USER_DEFAULTS: 'userDefaults/fetch',
  UPDATE_DEFAULTS: 'userDefaults/update',
  FETCH_USER_PREFERENCES: 'userPreferences/fetch',
};

// getting user defaults
export const fetchUserDefaults = createAsyncThunk(
  actionTypes.FETCH_USER_DEFAULTS,
  async (userId) => {
    const response = await getUserDefaults();
    return response.defaults.find((item) => item.user === userId);
  },
);

// updating user defaults
export const updateDefaults = createAsyncThunk(
  actionTypes.UPDATE_DEFAULTS,
  async ({ defaultId, defaults }) => {
    const response = await updateUserDefaults(defaultId, defaults);
    return response.defaults;
  },
);

// getting user preferences
export const fetchUserPreferences = createAsyncThunk(
  actionTypes.FETCH_USER_PREFERENCES,
  async (userId) => {
    const response = await getUserPreferencesApi(userId);
    return response.preferences;
  },
);

const userDefaultsSlice = createSlice({
  name: 'userDefaults',
  initialState: { defaults: null, preferences: null, status: 'idle', error: null },
  reducers: {
    clearChartStore: (state) => {
      state.defaults = null;
      state.status = 'idle';
      state.preferences = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.status = 'loading';
        },
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled'),
        (state, action) => {
          state.status = 'succeeded';
          if (action.type.startsWith(actionTypes.FETCH_USER_DEFAULTS)) {
            state.defaults = action.payload;
          } else if (action.type.startsWith(actionTypes.FETCH_USER_PREFERENCES)) {
            state.preferences = action.payload;
          }
        },
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed';
          state.error = action.error.message;
        },
      );
  },
});

export const { clearChartStore } = userDefaultsSlice.actions;

export default userDefaultsSlice.reducer;
