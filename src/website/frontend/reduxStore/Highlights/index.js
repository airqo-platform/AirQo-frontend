import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { isEmpty } from 'underscore';
import { getAllHighlightsApi, getAllTagsApi } from '../../apis';

// Async thunk for loading highlights data
export const loadHighlightsData = createAsyncThunk(
  'highlightsData/loadHighlightsData',
  async (_, { getState, rejectWithValue }) => {
    const lang = getState().eventsNavTab.languageTab;
    try {
      const resData = await getAllHighlightsApi(lang);
      if (isEmpty(resData || [])) return;
      return resData;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Async thunk for loading tags data
export const loadTagsData = createAsyncThunk(
  'highlightsData/loadTagsData',
  async (_, { getState, rejectWithValue }) => {
    const lang = getState().eventsNavTab.languageTab;
    try {
      const resData = await getAllTagsApi(lang);
      if (isEmpty(resData || [])) return;
      return resData;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const highlightsDataSlice = createSlice({
  name: 'highlightsData',
  initialState: {
    loading: false,
    highlights: [],
    tags: [],
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadHighlightsData.fulfilled, (state, action) => {
        state.highlights = action.payload;
      })
      .addCase(loadHighlightsData.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(loadTagsData.fulfilled, (state, action) => {
        state.tags = action.payload;
      })
      .addCase(loadTagsData.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export default highlightsDataSlice.reducer;
