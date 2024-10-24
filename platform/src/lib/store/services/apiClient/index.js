import { createSlice } from '@reduxjs/toolkit';

export const apiClientSlice = createSlice({
  name: 'apiClient',
  initialState: {
    clients: [],
    clientsDetails: [],
    refresh: false,
  },
  reducers: {
    addClients: (state, action) => {
      state.clients = action.payload;
    },
    addClientsDetails: (state, action) => {
      state.clientsDetails = action.payload;
    },
    performRefresh: (state) => {
      state.refresh = !state.refresh;
    },
  },
});

export const { addClients, addClientsDetails, performRefresh } =
  apiClientSlice.actions;
export default apiClientSlice.reducer;
