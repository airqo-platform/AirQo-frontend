import { configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { airqloudsApi } from './airQloudsApi';
import currentAirqloudReducer from './currentAirqloudSlice';

const store = () =>
  configureStore({
    reducer: {
      currentAirqloud: currentAirqloudReducer,
      [airqloudsApi.reducerPath]: airqloudsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(airqloudsApi.middleware),
  });

export const wrapper = createWrapper(store);

export default store;
