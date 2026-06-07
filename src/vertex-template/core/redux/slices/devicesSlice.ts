import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Device } from "@/app/types/devices";

interface DevicesState {
  devices: Device[];
  error: string | null;
  selectedDeviceId: string | null;
}

const initialState: DevicesState = {
  devices: [],
  error: null,
  selectedDeviceId: null,
};

export const devicesSlice = createSlice({
  name: "devices",
  initialState,
  reducers: {
    setDevices: (state, action: PayloadAction<Device[]>) => {
      state.devices = action.payload;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    setSelectedDevice: (state, action: PayloadAction<string>) => {
      state.selectedDeviceId = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setDevices, setError, setSelectedDevice, clearError } = devicesSlice.actions;

export default devicesSlice.reducer;
