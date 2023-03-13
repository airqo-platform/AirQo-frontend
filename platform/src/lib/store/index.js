import { configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { deviceRegistryApi } from './services/deviceRegistry';
import selectedCollocateDevicesReducer from './services/addMonitor/selectedCollocateDevicesSlice';
import { collocateApi } from './services/collocation';
import collocationDataReducer from './services/collocation/collocationDataSlice';

const store = () =>
  configureStore({
    reducer: {
      [deviceRegistryApi.reducerPath]: deviceRegistryApi.reducer,
      [collocateApi.reducerPath]: collocateApi.reducer,
      selectedCollocateDevices: selectedCollocateDevicesReducer,
      collocationData: collocationDataReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(deviceRegistryApi.middleware, collocateApi.middleware),
  });

export const wrapper = createWrapper(store);

export default store;
