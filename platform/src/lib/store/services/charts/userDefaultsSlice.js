import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUserDefaults, updateUserDefaults } from '@/core/apis/Account';

// getting user defaults
export const fetchUserDefaults = createAsyncThunk('userDefaults/fetch', async (userId) => {
  const response = await getUserDefaults();
  return response.defaults.find((item) => item.user === userId);
});

// updating user defaults
export const updateDefaults = createAsyncThunk(
  'userDefaults/update',
  async ({ defaultId, defaults }) => {
    const response = await updateUserDefaults(defaultId, defaults);
    return response.defaults;
  },
);

const userDefaultsSlice = createSlice({
  name: 'userDefaults',
  initialState: { defaults: null, status: 'idle', error: null },
  reducers: {
    clearChartStore: (state) => {
      state.defaults = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDefaults.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserDefaults.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.defaults = action.payload;
      })
      .addCase(fetchUserDefaults.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(updateDefaults.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateDefaults.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.defaults = action.payload;
      })
      .addCase(updateDefaults.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { clearChartStore } = userDefaultsSlice.actions;

export default userDefaultsSlice.reducer;
