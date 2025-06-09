import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Client, AccessToken } from "@/app/types/clients";

export interface ClientsState {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  clientsDetails: Client[];
  access_token: AccessToken[];
  refresh: boolean;
}

const initialState: ClientsState = {
  clients: [],
  isLoading: false,
  clientsDetails: [],
  access_token: [],
  refresh: false,
  error: null,
};

const clientSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    setClients(state, action: PayloadAction<Client[]>) {
      state.clients = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addClients: (state, action) => {
      state.clients = action.payload;
    },
    addClientsDetails: (state, action) => {
      state.clientsDetails = action.payload;
    },
    setAccessToken: (state, action) => {
      state.access_token = action.payload
    },
    setUserClients: (state, action) => {
      state.clientsDetails = action.payload;
    },
    performRefresh: (state) => {
      state.refresh = !state.refresh;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setClients,
  setLoading,
  addClients,
  addClientsDetails,
  performRefresh,
  setUserClients,
  setError,
} = clientSlice.actions;
export default clientSlice.reducer;
