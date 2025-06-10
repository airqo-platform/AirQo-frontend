import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getOrganisationRequestsApi } from '@/core/apis/Account';

const initialState = {
  organisationRequests: null,
  loading: false,
  error: null,
};

const fetchOrgRequests = createAsyncThunk(
  'organisationRequests/fetchOrganisationRequests',
  async () => {
    const response = await getOrganisationRequestsApi();
    return response.requests;
  },
);

export const organisationRequestsSlice = createSlice({
  name: 'organisationRequests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrgRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrgRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.organisationRequests = action.payload;
      })
      .addCase(fetchOrgRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export { fetchOrgRequests };
export default organisationRequestsSlice.reducer;
