import { configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { airqloudsApi } from './airQloudsApi';

const store = () =>
  configureStore({
    reducer: {
      [airqloudsApi.reducerPath]: airqloudsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(airqloudsApi.middleware),
  });

export const wrapper = createWrapper(store);

export default store;
