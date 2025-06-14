import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { persistReducer, persistStore } from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import thunk from 'redux-thunk';

// Create noop storage for SSR
const createNoopStorage = () => {
  return {
    getItem(_key) {
      return Promise.resolve(null);
    },
    setItem(_key, value) {
      return Promise.resolve(value);
    },
    removeItem(_key) {
      return Promise.resolve();
    },
  };
};

// Use appropriate storage based on environment
const storage =
  typeof window !== 'undefined'
    ? createWebStorage('local')
    : createNoopStorage();

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
import groupsReducer from './services/groups/GroupsSlice';
import { mapSlice } from './services/map/MapSlice';
import { locationSearchSlice } from './services/search/LocationSearchSlice';
import apiClientReducer from './services/apiClient/index';
import sidebarReducer from './services/sideBar/SideBarSlice';
import modalSlice from './services/downloadModal';
import sitesSummaryReducer from './services/sitesSummarySlice';
import { organisationRequestsSlice } from './services/admin/OrgRequestsSlice';

// Combine all the reducers
const rootReducer = combineReducers({
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
  groups: groupsReducer,
  locationSearch: locationSearchSlice.reducer,
  apiClient: apiClientReducer,
  sites: sitesSummaryReducer,
  organisationRequests: organisationRequestsSlice.reducer,
});

// Root reducer wrapper to handle state reset on logout
const appReducer = (state, action) => {
  if (action.type === 'RESET_APP' || action.type === 'LOGOUT_USER') {
    // Clear all state on logout or reset
    state = undefined; // This will clear the persisted state
  }
  return rootReducer(state, action);
};

// Configuration for redux-persist
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['login', 'checklists', 'groups'],
};

const persistedReducer = persistReducer(persistConfig, appReducer);

// Configure store function
const makeStore = () => {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            'persist/PERSIST',
            'persist/REHYDRATE',
            'persist/PURGE',
            'persist/REGISTER',
          ],
        },
      }).concat(thunk),
  });

  store.__persistor = persistStore(store);
  return store;
};

// Export the store wrapper
export const wrapper = createWrapper(makeStore);
export default makeStore;
