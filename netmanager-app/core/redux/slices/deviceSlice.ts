import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface Device {
  _id: string;
  group: string;
  name: string;
  authRequired: boolean;
  serial_number: string;
  api_code: string;
  groups: string[];
}


export interface DevicesState {
    devices: Device[];
    isLoading: boolean;
    error: string | null;
  }
  const initialState: DevicesState = {
    devices: [],
    isLoading: false,
    error: null,
  };

  const devicesSlice = createSlice({
    name: "devices",
    initialState,
    reducers: {
      setDevices(state, action: PayloadAction<Device[]>) {
        state.devices = action.payload;
        state.isLoading = false;
        state.error = null;
      },
      setLoading(state, action: PayloadAction<boolean>) {
        state.isLoading = action.payload;
      },
      setError(state, action: PayloadAction<string>) {
        state.error = action.payload;
        state.isLoading = false;
      },
    },
  });

export const { setDevices, setLoading, setError } = devicesSlice.actions;
export default devicesSlice.reducer;

