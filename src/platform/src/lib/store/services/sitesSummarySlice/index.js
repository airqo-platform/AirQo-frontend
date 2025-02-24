import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getSitesSummaryApi } from '@/core/apis/Analytics';

// Async thunk to fetch sites summary data with query params
export const fetchSitesSummary = createAsyncThunk(
  'sites/fetchSitesSummary',
  async ({ group } = {}, { rejectWithValue, signal }) => {
    try {
      let response;

      if (process.env.NODE_ENV === 'development') {
        // Make a request to the proxy, including query params
        response = await axios.get('/api/proxy/sites', {
          signal,
          headers: {
            'Content-Type': 'application/json',
          },
          params: { group },
        });

        if (response.status === 200 && response.data?.success === true) {
          return response.data?.sites || [];
        } else {
          throw new Error(
            response.data?.message || 'Failed to fetch sites summary.',
          );
        }
      } else {
        // Use direct API call in production
        const data = await getSitesSummaryApi({ group, signal });
        if (Array.isArray(data.sites)) {
          return data.sites;
        } else {
          throw new Error('Failed to fetch sites summary.');
        }
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.warn('Request was canceled:', error.message);
        return rejectWithValue('Request was aborted.');
      }

      console.error('Error fetching sites summary:', error.message || error);
      return rejectWithValue(error.message || 'An error occurred.');
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
        state.sitesSummaryData = action.payload;
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
