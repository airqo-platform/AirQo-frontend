import { configureStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import rootReducer from '@/lib/redux';

const preloadedState = {};
const middleware = [thunk];
const store = configureStore({
  reducer: rootReducer,
  preloadedState,
  middleware: middleware,
});
export default store;
