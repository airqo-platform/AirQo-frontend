import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedCollocateDevices: [],
  isLoading: false,
};

const selectedCollocateDevicesSlice = createSlice({
  name: 'selectedCollocateDevices',
  initialState,
  reducers: {
    addDevices: (state, action) => {
      state.isLoading = true;
      console.log(state.isLoading);
      const devices = action.payload;
      const newDevices = new Set([...state.selectedCollocateDevices, ...devices]);
      state.selectedCollocateDevices = [...newDevices];
      state.isLoading = false;
      console.log(state.isLoading);
    },
    addDevice(state, action) {
      state.isLoading = true;
      const device = action.payload;
      const newDevices = new Set([...state.selectedCollocateDevices, device]);
      state.selectedCollocateDevices = [...newDevices];
      state.isLoading = false;
    },
    removeDevices: (state, action) => {
      state.isLoading = true;
      const stateDevices = new Set(state.selectedCollocateDevices);
      const devicesToRemove = new Set(action.payload);
      state.selectedCollocateDevices = [stateDevices.difference(devicesToRemove)];
      state.isLoading = false;
    },
  },
});

export const { addDevices, removeDevices, addDevice } = selectedCollocateDevicesSlice.actions;

export default selectedCollocateDevicesSlice.reducer;
