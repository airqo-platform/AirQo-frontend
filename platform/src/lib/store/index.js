import { configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

// Import your reducers
import deviceRegistryReducer from './services/deviceRegistry';
import selectedCollocateDevicesReducer from './services/collocation/selectedCollocateDevicesSlice';
import collocationReducer from './services/collocation';
import collocationDataReducer from './services/collocation/collocationDataSlice';
import { createAccountSlice } from './services/account/CreationSlice';
import { userLoginSlice } from './services/account/LoginSlice';
import chartsReducer from './services/charts/ChartSlice';
import { gridsSlice } from './services/deviceRegistry/GridsSlice';
import defaultsReducer from './services/account/UserDefaultsSlice';
import recentMeasurementReducer from './services/deviceRegistry/RecentMeasurementsSlice';
import cardReducer from './services/checklists/CheckList';
import checklistsReducer from './services/checklists/CheckData';
import analyticsReducer from './services/charts/ChartData';
import { groupInfoSlice } from './services/groups/GroupInfoSlice';
import { mapSlice } from './services/map/MapSlice';
import { locationSearchSlice } from './services/search/LocationSearchSlice';
import apiClientReducer from './services/apiClient/index';
import sidebarReducer from './services/sideBar/SideBarSlice';
import modalSlice from './services/downloadModal';
import sitesSummaryReducer from './services/sitesSummarySlice';

const appReducer = combineReducers({
  deviceRegistry: deviceRegistryReducer,
  sidebar: sidebarReducer,
  collocation: collocationReducer,
  selectedCollocateDevices: selectedCollocateDevicesReducer,
  modal: modalSlice,
  collocationData: collocationDataReducer,
  creation: createAccountSlice.reducer,
  login: userLoginSlice.reducer,
  chart: chartsReducer,
  grids: gridsSlice.reducer,
  defaults: defaultsReducer,
  cardChecklist: cardReducer,
  map: mapSlice.reducer,
  recentMeasurements: recentMeasurementReducer,
  checklists: checklistsReducer,
  analytics: analyticsReducer,
  groupInfo: groupInfoSlice.reducer,
  locationSearch: locationSearchSlice.reducer,
  apiClient: apiClientReducer,
  sites: sitesSummaryReducer,
});

const rootReducer = (state, action) => {
  if (action.type === 'RESET_APP') {
    state = undefined;
  }
  return appReducer(state, action);
};

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['login', 'checklists'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const makeStore = () => {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: true,
        immutableCheck: false,
        serializableCheck: false,
      }),
  });

  store.__persistor = persistStore(store);
  return store;
};

export const wrapper = createWrapper(makeStore);

export default makeStore;
