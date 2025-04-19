import { configureStore, combineReducers } from "@reduxjs/toolkit"
import userReducer from "./slices/userSlice"
import sitesReducer from "./slices/sitesSlice"
import devicesReducer from "./slices/devicesSlice"
import cohortsReducer from "./slices/cohortsSlice"
import gridsReducer from "./slices/gridsSlice"
import clientsReducer from "./slices/clientsSlice"
import groupsReducer from "./slices/groupsSlice"
import teamReducer from "./slices/teamSlice"
import groupDetailsReducer from "./slices/groupDetailsSlice"

// Define a reset action type
export const RESET_STORE = "RESET_STORE"

const appReducer = combineReducers({
  user: userReducer,
  sites: sitesReducer,
  devices: devicesReducer,
  grids: gridsReducer,
  cohorts: cohortsReducer,
  clients: clientsReducer,
  groups: groupsReducer,
  team: teamReducer,
  groupDetails: groupDetailsReducer,
})

// Root reducer that can handle store reset
const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: { type: string }) => {
  // When the RESET_STORE action is dispatched, reset the entire state
  if (action.type === RESET_STORE) {
    return appReducer(undefined, action)
  }

  // Otherwise, process the action normally
  return appReducer(state, action)
}

// Configure the store with the root reducer
export const store = configureStore({
  reducer: rootReducer,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
