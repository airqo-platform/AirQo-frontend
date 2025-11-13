import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import userReducer from "./slices/userSlice";
import sitesReducer from "./slices/sitesSlice";
import devicesReducer from "./slices/devicesSlice";
import cohortsReducer from "./slices/cohortsSlice";
import gridsReducer from "./slices/gridsSlice";
import groupsReducer from "./slices/groupsSlice";
const userPersistConfig = {
  key: "user",
  storage,
  whitelist: [
    "userDetails",
    "userGroups",
    "activeGroup",
    "userContext",
    "activeNetwork",
  ],
};
const rootReducer = combineReducers({
  user: persistReducer(userPersistConfig, userReducer),
  sites: sitesReducer,
  devices: devicesReducer,
  grids: gridsReducer,
  cohorts: cohortsReducer,
  groups: groupsReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
