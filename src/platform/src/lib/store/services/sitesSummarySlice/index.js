import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getSitesSummaryApi } from '@/core/apis/Analytics';

// Fetch sites summary data
export const fetchSitesSummary = createAsyncThunk(
  'sites/fetchSitesSummary',
  async ({ group } = {}, { rejectWithValue, signal }) => {
    try {
      const data = await getSitesSummaryApi({ group, signal });
      return Array.isArray(data.sites) ? data.sites : [];
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred.');
    }
  },
);

const sitesSummarySlice = createSlice({
  name: 'sites',
  initialState: {
    sitesSummaryData: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSitesSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSitesSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.sitesSummaryData = action.payload;
      })
      .addCase(fetchSitesSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      });
  },
});

export default sitesSummarySlice.reducer;
