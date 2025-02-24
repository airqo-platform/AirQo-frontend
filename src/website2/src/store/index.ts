import { configureStore } from '@reduxjs/toolkit';

import countryReducer from './slices/countrySlice';
import forum from './slices/forumSlice';
import modalReducer from './slices/modalSlice';

const store = configureStore({
  reducer: {
    modal: modalReducer,
    country: countryReducer,
    forum: forum,
  },
});

// Define the root state and dispatch types for use throughout the app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
