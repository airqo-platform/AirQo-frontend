import { createSlice } from '@reduxjs/toolkit';
import { collocateDevices } from '.';

const collocationDataSlice = createSlice({
  name: 'collocationData',
  initialState: {
    collocationData: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    addCollocationData(state, action) {
      console.log(action.payload);
      state.collocationData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(collocateDevices.matchPending, (state, action) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(collocateDevices.matchFulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        const collocationData = action.payload;
        // Dispatch the 'addCollocationData' action to update the state with the new post data
        collocationDataSlice.actions.addCollocationData(collocationData);
      })
      .addMatcher(collocateDevices.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { addCollocationData } = collocationDataSlice.actions;

export default collocationDataSlice.reducer;
