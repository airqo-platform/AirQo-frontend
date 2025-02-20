import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { isEmpty } from 'underscore';
import { getAllTeamMembersApi } from '../../apis';

// Async thunk for loading team data
export const loadTeamData = createAsyncThunk(
  'teamData/loadTeamData',
  async (_, { getState, rejectWithValue }) => {
    const lang = getState().eventsNavTab.languageTab;
    try {
      const resData = await getAllTeamMembersApi(lang);
      if (isEmpty(resData || [])) return;
      return resData;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const teamDataSlice = createSlice({
  name: 'teamData',
  initialState: {
    loading: false,
    team: [],
    error: null
  },
  reducers: {
    updateTeamLoader: (state, action) => {
      state.loading = action.payload.loading;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTeamData.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadTeamData.fulfilled, (state, action) => {
        state.team = action.payload;
        state.loading = false;
      })
      .addCase(loadTeamData.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  }
});

export const { updateTeamLoader } = teamDataSlice.actions;

export default teamDataSlice.reducer;
