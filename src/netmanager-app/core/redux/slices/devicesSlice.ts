import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Device } from "@/app/types/devices";

interface DevicesState {
  devices: Device[];
  error: string | null;
  selectedDevice: Device | null;
}

const initialState: DevicesState = {
  devices: [],
  error: null,
  selectedDevice: null,
};

const devicesSlice = createSlice({
  name: "devices",
  initialState,
  reducers: {
    setDevices(state: DevicesState, action: PayloadAction<Device[]>) {
      state.devices = action.payload;
      state.error = null;
    },
    setError(state: DevicesState, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    setSelectedDevice(
      state: DevicesState,
      action: PayloadAction<Device | null>
    ) {
      state.selectedDevice = action.payload;
    },
    clearDevices(state: DevicesState) {
      state.devices = [];
      state.error = null;
      state.selectedDevice = null;
    },
  },
});

export const { setDevices, setError, setSelectedDevice, clearDevices } =
  devicesSlice.actions;
export default devicesSlice.reducer;
