import { configureStore } from '@reduxjs/toolkit';

import countryReducer from './slices/countrySlice';
import modalReducer from './slices/modalSlice';

const store = configureStore({
  reducer: {
    modal: modalReducer,
    country: countryReducer,
  },
});

// Define the root state and dispatch types for use throughout the app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
