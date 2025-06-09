import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getGroupDetailsApi } from '@/core/apis/Account';

const initialState = {
  groupInfo: null,
  loading: false,
  error: null,
};

const fetchGroupInfo = createAsyncThunk(
  'groups/fetchGroupInfo',
  async (groupId) => {
    const response = await getGroupDetailsApi(groupId);
    return response.group;
  },
);

export const groupInfoSlice = createSlice({
  name: 'groupInfo',
  initialState,
  reducers: {
    updateGroupLogo: (state, action) => {
      if (state.groupInfo) {
        state.groupInfo.grp_image = action.payload;
      }
    },
    updateGroupInfo: (state, action) => {
      if (state.groupInfo) {
        state.groupInfo = { ...state.groupInfo, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroupInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.groupInfo = action.payload;
      })
      .addCase(fetchGroupInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateGroupLogo, updateGroupInfo } = groupInfoSlice.actions;
export { fetchGroupInfo };
export default groupInfoSlice.reducer;
