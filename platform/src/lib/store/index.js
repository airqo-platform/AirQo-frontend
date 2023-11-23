import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import deviceRegistryReducer from './services/deviceRegistry';
import selectedCollocateDevicesReducer from './services/collocation/selectedCollocateDevicesSlice';
import collocationReducer from './services/collocation';
import collocationDataReducer from './services/collocation/collocationDataSlice';
import { createAccountSlice } from './services/account/CreationSlice';
import { userLoginSlice } from './services/account/LoginSlice';
import { chartSlice } from './services/charts/ChartSlice';
import { gridsSlice } from './services/deviceRegistry/GridsSlice';
import { defaultsSlice } from './services/account/UserDefaultsSlice';
import userDefaultsReducer from './services/charts/userDefaultsSlice';
import { recentMeasurementsSlice } from './services/deviceRegistry/RecentMeasurementsSlice';
import { cardSlice } from './services/checklists/CheckList';
import checklistsReducer from './services/checklists/CheckData';
import analyticsReducer from './services/charts/ChartData';
import { groupInfoSlice } from './services/groups/GroupInfoSlice';

const persistConfig = {
  key: 'root',
  storage,
};

const rootReducer = combineReducers({
  deviceRegistry: deviceRegistryReducer,
  collocation: collocationReducer,
  selectedCollocateDevices: selectedCollocateDevicesReducer,
  collocationData: collocationDataReducer,
  [createAccountSlice.name]: createAccountSlice.reducer,
  [userLoginSlice.name]: userLoginSlice.reducer,
  [chartSlice.name]: chartSlice.reducer,
  [gridsSlice.name]: gridsSlice.reducer,
  [defaultsSlice.name]: defaultsSlice.reducer,
  [cardSlice.name]: cardSlice.reducer,
  userDefaults: userDefaultsReducer,
  [recentMeasurementsSlice.name]: recentMeasurementsSlice.reducer,
  checklists: checklistsReducer,
  analytics: analyticsReducer,
  [groupInfoSlice.name]: groupInfoSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = () =>
  configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware({
      thunk: true,
      immutableCheck: true,
      serializableCheck: false,
    }),
  });

export const wrapper = createWrapper(store);

export default store;
