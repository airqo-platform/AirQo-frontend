import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { themeReducer } from '@/modules/themes';
import uiReducer from './uiSlice';
import userReducer from './userSlice';
import insightsReducer from './insightsSlice';
import cohortReducer from './cohortSlice';
import mapSettingsReducer from './mapSettingsSlice';
import selectedLocationReducer from './selectedLocationSlice';
import analyticsReducer from '@/modules/analytics/store/analyticsSlice';

const userPersistConfig = {
  key: 'user',
  storage,
  whitelist: ['user', 'groups', 'activeGroup'], // Persist user data, groups, and active group
};

const themePersistConfig = {
  key: 'theme',
  storage,
  // Persist all theme state
};

const mapSettingsPersistConfig = {
  key: 'mapSettings',
  storage,
  // Persist all map settings
};

const uiPersistConfig = {
  key: 'ui',
  storage,
  whitelist: ['sidebarCollapsed'], // Only persist sidebar collapsed state
};

const persistedUserReducer = persistReducer(userPersistConfig, userReducer);
const persistedThemeReducer = persistReducer(themePersistConfig, themeReducer);
const persistedMapSettingsReducer = persistReducer(
  mapSettingsPersistConfig,
  mapSettingsReducer
);
const persistedUIReducer = persistReducer(uiPersistConfig, uiReducer);

export const store = configureStore({
  reducer: {
    theme: persistedThemeReducer,
    ui: persistedUIReducer,
    user: persistedUserReducer,
    insights: insightsReducer,
    cohorts: cohortReducer,
    mapSettings: persistedMapSettingsReducer,
    selectedLocation: selectedLocationReducer,
    analytics: analyticsReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PURGE',
        ],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
