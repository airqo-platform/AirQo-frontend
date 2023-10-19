import { createSlice } from '@reduxjs/toolkit';
import { isEmpty } from 'underscore';

const initialState = {
  selectedCollocateDevices: [],
  isLoading: false,
  startDate: null,
  endDate: null,
  scheduledBatchName: '',
  scheduledBatchDataCompletenessThreshold: 80,
  scheduledBatchInterCorrelationThreshold: 0.98,
  scheduledBatchIntraCorrelationThreshold: 0.98,
  scheduledBatchDifferencesThreshold: 5,
};

const selectedCollocateDevicesSlice = createSlice({
  name: 'selectedCollocateDevices',
  initialState,
  reducers: {
    addDevices: (state, action) => {
      state.isLoading = true;
      const devices = [...action.payload];
      state.selectedCollocateDevices = [
        ...new Set([...state.selectedCollocateDevices, ...devices]),
      ];
      state.isLoading = false;
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
    addStartDate: (state, action) => {
      state.startDate = action.payload;
    },
    addEndDate: (state, action) => {
      state.endDate = action.payload;
    },
    addScheduledBatchName: (state, action) => {
      state.scheduledBatchName = action.payload;
    },
    addScheduledBatchDataCompletenessThreshold: (state, action) => {
      if (!isEmpty(action.payload)) {
        state.scheduledBatchDataCompletenessThreshold = parseFloat(action.payload);
      }
    },
    addScheduledBatchInterCorrelationThreshold: (state, action) => {
      if (!isEmpty(action.payload)) {
        state.scheduledBatchInterCorrelationThreshold = parseFloat(action.payload);
      }
    },
    addScheduledBatchIntraCorrelationThreshold: (state, action) => {
      if (!isEmpty(action.payload)) {
        state.scheduledBatchIntraCorrelationThreshold = parseFloat(action.payload);
      }
    },
    addScheduledBatchDifferencesThreshold: (state, action) => {
      if (!isEmpty(action.payload)) {
        state.scheduledBatchDifferencesThreshold = action.payload;
      }
    },
  },
});

export const {
  addDevices,
  removeDevices,
  addDevice,
  addStartDate,
  addEndDate,
  addScheduledBatchName,
  addScheduledBatchDataCompletenessThreshold,
  addScheduledBatchDifferencesThreshold,
  addScheduledBatchInterCorrelationThreshold,
  addScheduledBatchIntraCorrelationThreshold,
} = selectedCollocateDevicesSlice.actions;

export default selectedCollocateDevicesSlice.reducer;
