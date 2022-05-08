import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reduxStore';

const store = configureStore({ reducer: rootReducer });
export default store;
