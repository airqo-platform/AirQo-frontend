import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { isEmpty } from 'underscore';
import { getBoardMembersApi } from 'apis';

// Async thunk for loading board data
export const loadBoardData = createAsyncThunk(
  'boardData/loadBoardData',
  async (_, { getState, rejectWithValue }) => {
    const lang = getState().eventsNavTab.languageTab;
    try {
      const resData = await getBoardMembersApi(lang);
      if (isEmpty(resData || [])) return;
      return resData;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const boardDataSlice = createSlice({
  name: 'boardData',
  initialState: {
    loading: false,
    board: [],
    error: null
  },
  reducers: {
    updateBoardLoader: (state, action) => {
      state.loading = action.payload.loading;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadBoardData.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadBoardData.fulfilled, (state, action) => {
        state.board = action.payload;
        state.loading = false;
      })
      .addCase(loadBoardData.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  }
});

export const { updateBoardLoader } = boardDataSlice.actions;

export default boardDataSlice.reducer;
