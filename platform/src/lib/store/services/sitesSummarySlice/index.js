import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getSitesSummaryApi } from '@/core/apis/Analytics'; // Adjust the path according to your folder structure

// Async thunk to fetch sites summary data
export const fetchSitesSummary = createAsyncThunk(
  'sites/fetchSitesSummary',
  async (_, { rejectWithValue, signal }) => {
    try {
      // Call the API function
      const data = await getSitesSummaryApi({ signal });
      return data.sites;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const initialState = {
  sitesSummaryData: null,
  loading: false,
  error: null,
};

const sitesSummarySlice = createSlice({
  name: 'sites',
  initialState,
  reducers: {
    // You can add additional non-async actions here if needed
  },
  extraReducers: (builder) => {
    builder
      // When the fetch begins
      .addCase(fetchSitesSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // When the fetch is successful
      .addCase(fetchSitesSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.sitesSummaryData = action.payload; // Store the fetched data
      })
      // When the fetch fails
      .addCase(fetchSitesSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      });
  },
});

// Export the reducer, so it can be included in the store
export default sitesSummarySlice.reducer;
