import { configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { deviceRegistryApi } from './services/deviceRegistry';

const store = () =>
  configureStore({
    reducer: {
      [deviceRegistryApi.reducerPath]: deviceRegistryApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(deviceRegistryApi.middleware),
  });

export const wrapper = createWrapper(store);

export default store;
