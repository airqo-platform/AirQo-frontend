import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeGroup: null,
  loading: false,
  error: null,
};

export const activeGroupSlice = createSlice({
  name: 'activeGroup',
  initialState,
  reducers: {
    setActiveGroup: (state, action) => {
      state.activeGroup = action.payload;
      state.error = null;
    },
    setActiveGroupLoading: (state, action) => {
      state.loading = action.payload;
    },
    setActiveGroupError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearActiveGroup: (state) => {
      state.activeGroup = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  setActiveGroup,
  setActiveGroupLoading,
  setActiveGroupError,
  clearActiveGroup,
} = activeGroupSlice.actions;

export default activeGroupSlice.reducer;
