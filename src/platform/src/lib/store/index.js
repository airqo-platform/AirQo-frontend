import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import {
  actionDebouncingMiddleware,
  performanceMiddleware,
  memoryOptimizationMiddleware,
  batchingMiddleware,
  errorHandlingMiddleware,
  cleanupMiddleware,
} from './middleware/performanceMiddleware';

// Create noop storage for SSR
const createNoopStorage = () => {
  return {
    getItem() {
      return Promise.resolve(null);
    },
    setItem(_value) {
      return Promise.resolve(_value);
    },
    removeItem() {
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
import { createAccountSlice } from './services/account/CreationSlice';
import { userLoginSlice } from './services/account/LoginSlice';
import chartsReducer from './services/charts/ChartSlice';
import { gridsSlice } from './services/deviceRegistry/GridsSlice';
import defaultsReducer from './services/account/UserDefaultsSlice';
import recentMeasurementReducer from './services/deviceRegistry/RecentMeasurementsSlice';
import cardReducer from './services/checklists/CheckList';
import analyticsReducer from './services/charts/ChartData';
import groupsReducer from './services/groups/GroupsSlice';
import { mapSlice } from './services/map/MapSlice';
import { locationSearchSlice } from './services/search/LocationSearchSlice';
import apiClientReducer from './services/apiClient/index';
import sidebarReducer from './services/sideBar/SideBarSlice';
import modalSlice from './services/downloadModal';
import sitesSummaryReducer from './services/sitesSummarySlice';
import { organisationRequestsSlice } from './services/admin/OrgRequestsSlice';
import organizationThemeReducer from './services/organizationTheme/OrganizationThemeSlice';
import moreInsightsReducer from './services/moreInsights';
import permissionsReducer from './services/permissions/PermissionsSlice';

// Combine all the reducers
const rootReducer = combineReducers({
  deviceRegistry: deviceRegistryReducer,
  sidebar: sidebarReducer,
  modal: modalSlice,
  creation: createAccountSlice.reducer,
  login: userLoginSlice.reducer,
  chart: chartsReducer,
  grids: gridsSlice.reducer,
  defaults: defaultsReducer,
  cardChecklist: cardReducer,
  map: mapSlice.reducer,
  recentMeasurements: recentMeasurementReducer,
  analytics: analyticsReducer,
  groups: groupsReducer,
  locationSearch: locationSearchSlice.reducer,
  apiClient: apiClientReducer,
  sites: sitesSummaryReducer,
  organisationRequests: organisationRequestsSlice.reducer,
  organizationTheme: organizationThemeReducer,
  moreInsights: moreInsightsReducer,
  permissions: permissionsReducer,
});

// Root reducer wrapper to handle state reset on logout
const appReducer = (state, action) => {
  if (action.type === 'RESET_APP' || action.type === 'LOGOUT_USER') {
    // Clear all state on logout or reset
    state = undefined;
  }
  return rootReducer(state, action);
};

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['login', 'cardChecklist', 'groups', 'organizationTheme', 'map'],
  version: 1, // Increment this to force state migration
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
      })
        .concat(actionDebouncingMiddleware)
        .concat(performanceMiddleware)
        .concat(memoryOptimizationMiddleware)
        .concat(batchingMiddleware)
        .concat(errorHandlingMiddleware)
        .concat(cleanupMiddleware),
  });

  const persistor = persistStore(store);
  // Back-compat: expose store and persistor the old way too
  // Avoid in SSR
  if (typeof window !== 'undefined') {
    window.__NEXT_REDUX_STORE__ = store;
  }
  // Legacy callers may rely on this
  store.__persistor = persistor;
  // Option A: keep previous API
  return store;
};

// Default export the makeStore factory for client-side initialization
export default makeStore;
