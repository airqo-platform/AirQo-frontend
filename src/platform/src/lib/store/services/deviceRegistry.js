import { createSlice } from '@reduxjs/toolkit';
// Device registry slice (collocation removed)

const deviceRegistrySlice = createSlice({
  name: 'deviceRegistry',
  initialState: {
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // no extra reducers required for collocation (feature removed)
    return builder;
  },
});

export default deviceRegistrySlice.reducer;
