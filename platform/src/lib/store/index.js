import { configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

// Import your reducers
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
import { mapSlice } from './services/map/MapSlice';
import { locationSearchSlice } from './services/search/LocationSearchSlice';
import { apiClientSlice } from './services/apiClient/index';
import sidebarReducer from './services/sideBar/SideBarSlice';
import modalSlice from './services/downloadModal';

const appReducer = combineReducers({
  deviceRegistry: deviceRegistryReducer,
  sidebar: sidebarReducer,
  collocation: collocationReducer,
  selectedCollocateDevices: selectedCollocateDevicesReducer,
  modal: modalSlice,
  collocationData: collocationDataReducer,
  creation: createAccountSlice.reducer,
  login: userLoginSlice.reducer,
  chart: chartSlice.reducer,
  grids: gridsSlice.reducer,
  defaults: defaultsSlice.reducer,
  cardChecklist: cardSlice.reducer,
  map: mapSlice.reducer,
  userDefaults: userDefaultsReducer,
  recentMeasurements: recentMeasurementsSlice.reducer,
  checklists: checklistsReducer,
  analytics: analyticsReducer,
  groupInfo: groupInfoSlice.reducer,
  locationSearch: locationSearchSlice.reducer,
  apiClient: apiClientSlice.reducer,
});

const rootReducer = (state, action) => {
  if (action.type === 'RESET_APP') {
    // to clear the state of all reducers
    state = undefined;
  }
  return appReducer(state, action);
};

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['login', 'userDefaults', 'checklists'], // Only persist these reducers
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const makeStore = () => {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });

  store.__persistor = persistStore(store); // Expose persistor on the store
  return store;
};

export const wrapper = createWrapper(makeStore);

export default makeStore;
