import { configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { deviceRegistryApi } from './services/deviceRegistry';
import selectedCollocateDevicesReducer from './services/collocation/selectedCollocateDevicesSlice';
import { collocateApi } from './services/collocation';
import collocationDataReducer from './services/collocation/collocationDataSlice';
import { createAccountSlice } from './services/account/CreationSlice';
import { userLoginSlice } from './services/account/LoginSlice';

const store = () =>
  configureStore({
    reducer: {
      [deviceRegistryApi.reducerPath]: deviceRegistryApi.reducer,
      [collocateApi.reducerPath]: collocateApi.reducer,
      selectedCollocateDevices: selectedCollocateDevicesReducer,
      collocationData: collocationDataReducer,
      [createAccountSlice.name]: createAccountSlice.reducer,
      [userLoginSlice.name]: userLoginSlice.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(deviceRegistryApi.middleware, collocateApi.middleware),
  });

export const wrapper = createWrapper(store);

export default store;
