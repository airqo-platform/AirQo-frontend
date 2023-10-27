import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import { deviceRegistryApi } from './services/deviceRegistry';
import selectedCollocateDevicesReducer from './services/collocation/selectedCollocateDevicesSlice';
import { collocateApi } from './services/collocation';
import collocationDataReducer from './services/collocation/collocationDataSlice';
import { createAccountSlice } from './services/account/CreationSlice';
import { userLoginSlice } from './services/account/LoginSlice';
import { gridsSlice } from './services/deviceRegistry/GridsSlice';

const persistConfig = {
  key: 'root',
  storage,
};

const rootReducer = combineReducers({
  [deviceRegistryApi.reducerPath]: deviceRegistryApi.reducer,
  [collocateApi.reducerPath]: collocateApi.reducer,
  selectedCollocateDevices: selectedCollocateDevicesReducer,
  collocationData: collocationDataReducer,
  [createAccountSlice.name]: createAccountSlice.reducer,
  [userLoginSlice.name]: userLoginSlice.reducer,
  [gridsSlice.name]: gridsSlice.reducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = () =>
  configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware({
      thunk: true,
      immutableCheck: true,
      serializableCheck: false,
    }).concat(deviceRegistryApi.middleware, collocateApi.middleware),
  });

export const wrapper = createWrapper(store);

export default store;
