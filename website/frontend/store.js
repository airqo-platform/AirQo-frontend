import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reduxStore';

const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production'
});

export default store;
