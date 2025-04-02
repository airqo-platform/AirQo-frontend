import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import thunk from 'redux-thunk';

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
import sidebarReducer from './services/sideBar/SideBarSlice';
import modalSlice from './services/downloadModal';
import sitesSummaryReducer from './services/sitesSummarySlice';

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
  groupInfo: groupInfoSlice.reducer,
  locationSearch: locationSearchSlice.reducer,
  sites: sitesSummaryReducer,
});

// Root reducer wrapper to handle state reset on logout
const appReducer = (state, action) => {
  if (action.type === 'RESET_APP') {
    state = undefined; // This will clear the persisted state
  }
  return rootReducer(state, action);
};

// Configuration for redux-persist
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['login', 'checklists'],
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
