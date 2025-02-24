import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { isEmpty } from 'underscore';
import { getAllPublicationsApi } from '../../apis';

// Async thunk for loading publications data
export const loadPublicationsData = createAsyncThunk(
  'publicationsData/loadPublicationsData',
  async (_, { getState, rejectWithValue }) => {
    const lang = getState().eventsNavTab.languageTab;
    try {
      const resData = await getAllPublicationsApi(lang);
      if (isEmpty(resData || [])) return;
      return resData;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const publicationsDataSlice = createSlice({
  name: 'publicationsData',
  initialState: {
    loading: false,
    publications: [],
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadPublicationsData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadPublicationsData.fulfilled, (state, action) => {
        state.loading = false;
        state.publications = action.payload;
      })
      .addCase(loadPublicationsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default publicationsDataSlice.reducer;
