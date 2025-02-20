import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  searchTerm: '',
  searchResults: [],
};

export const locationSearchSlice = createSlice({
  name: 'locationSearch',
  initialState,
  reducers: {
    addSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    addSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
  },
});

export const { addSearchTerm, addSearchResults } = locationSearchSlice.actions;
