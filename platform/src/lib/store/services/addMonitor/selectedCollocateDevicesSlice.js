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
      const devices = [...action.payload];
      state.selectedCollocateDevices = [...new Set([...state.selectedCollocateDevices, ...devices])];
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
      const stateDevices = new Set([...state.selectedCollocateDevices]);
      const devicesToRemove = new Set(action.payload);
      devicesToRemove.forEach((device) => stateDevices.delete(device));
      state.selectedCollocateDevices = [...stateDevices];
      state.isLoading = false;
    },
  },
});

export const { addDevices, removeDevices, addDevice } = selectedCollocateDevicesSlice.actions;

export default selectedCollocateDevicesSlice.reducer;
