import { createSlice } from '@reduxjs/toolkit';

export const apiClientSlice = createSlice({
  name: 'apiClient',
  initialState: {
    clients: null,
    clientsDetails: null,
  },
  reducers: {
    addClients: (state, action) => {
      state.clients = action.payload;
    },
    addClientsDetails: (state, action) => {
      state.clientsDetails = action.payload;
    },
  },
});

export const { addClients, addClientsDetails } = apiClientSlice.actions;
export default apiClientSlice.reducer;
