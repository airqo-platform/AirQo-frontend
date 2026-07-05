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
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import userReducer from "./slices/userSlice";
import sitesReducer from "./slices/sitesSlice";
import devicesReducer from "./slices/devicesSlice";
import cohortsReducer from "./slices/cohortsSlice";
import groupsReducer from "./slices/groupsSlice";

// Create a conditional storage object to handle SSR
const createNoopStorage = () => {
  return {
    getItem: () => Promise.resolve(null),
    setItem: (...args: [string, string]) => Promise.resolve(args[1]),
    removeItem: () => Promise.resolve(),
  };
};

const storageToUse =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

const userPersistConfig = {
  key: "user",
  storage: storageToUse,
  whitelist: [
    "userDetails",
    "userGroups",
    "activeGroup",
    "userContext",
    "activeNetwork",
    "isAuthenticated",
    "isInitialized", 
  ],
};
const rootReducer = combineReducers({
  user: persistReducer(userPersistConfig, userReducer),
  sites: sitesReducer,
  devices: devicesReducer,
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
