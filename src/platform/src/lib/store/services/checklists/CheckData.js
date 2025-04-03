import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUserChecklists, upsertUserChecklists } from '@/core/apis/Account';

export const fetchUserChecklists = createAsyncThunk(
  'checklists/fetchUserChecklists',
  async (userID) => {
    const response = await getUserChecklists(userID);
    return response.checklists;
  },
);

export const updateUserChecklists = createAsyncThunk(
  'checklists/updateUserChecklists',
  async (checklist) => {
    const response = await upsertUserChecklists(checklist);
    return response.data;
  },
);

const checklistsSlice = createSlice({
  name: 'checklistData',
  initialState: { checklist: [], status: 'idle', error: null },
  reducers: {
    resetChecklist: (state) => {
      state.checklist = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserChecklists.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserChecklists.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.checklist =
          action.payload.length === 0 ? 'Empty' : action.payload;
      })
      .addCase(fetchUserChecklists.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateUserChecklists.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateUserChecklists.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload) {
          state.checklist = state.checklist.map((entity) =>
            entity.id === action.payload.id ? action.payload : entity,
          );
        }
      })
      .addCase(updateUserChecklists.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetChecklist } = checklistsSlice.actions;

export default checklistsSlice.reducer;
