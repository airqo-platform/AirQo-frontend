import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '@/lib/redux';

const store = configureStore({
  reducer: rootReducer,
});

export default store;
