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
import { chartSlice } from './services/charts/ChartSlice';
import { gridsSlice } from './services/deviceRegistry/GridsSlice';
import { defaultsSlice } from './services/account/UserDefaultsSlice';
import userDefaultsReducer from './services/charts/userDefaultsSlice';
import { cardSlice } from './services/checklists/CheckList';
import checklistsReducer from './services/checklists/CheckData';
import analyticsReducer from './services/charts/ChartData';

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
  [chartSlice.name]: chartSlice.reducer,
  [gridsSlice.name]: gridsSlice.reducer,
  [defaultsSlice.name]: defaultsSlice.reducer,
  [cardSlice.name]: cardSlice.reducer,
  userDefaults: userDefaultsReducer,
  checklists: checklistsReducer,
  analytics: analyticsReducer,
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
