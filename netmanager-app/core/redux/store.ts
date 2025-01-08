import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import sitesReducer from "./slices/sitesSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    sites: sitesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
