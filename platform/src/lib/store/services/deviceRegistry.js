import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { DEVICES } from '@/core/urls/deviceRegistry';
import createAxiosInstance from '@/core/apis/axiosConfig';

export const getCollocationDevices = createAsyncThunk(
  'deviceRegistry/getCollocationDevices',
  async () => {
    const response = await createAxiosInstance(false).get(`${DEVICES}/events/running`);
    return response.data;
  },
);

const deviceRegistrySlice = createSlice({
  name: 'deviceRegistry',
  initialState: {
    collocationDevices: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCollocationDevices.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getCollocationDevices.fulfilled, (state, action) => {
        console.log(action.payload.data);
        state.status = 'succeeded';
        state.collocationDevices = action.payload.data;
      })
      .addCase(getCollocationDevices.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default deviceRegistrySlice.reducer;
