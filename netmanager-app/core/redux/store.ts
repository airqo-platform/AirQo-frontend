import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import sitesReducer from "./slices/sitesSlice";
import devicesReducer from "./slices/devicesSlice";
import cohortsReducer from "./slices/cohortsSlice";
import gridsReducer from "./slices/gridsSlice";
import clientsRudcer from "./slices/clientsSlice";
import groupsReducer from "./slices/groupsSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    sites: sitesReducer,
    devices: devicesReducer,
    grids: gridsReducer,
    cohorts: cohortsReducer,
    clients: clientsRudcer,
    groups: groupsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
