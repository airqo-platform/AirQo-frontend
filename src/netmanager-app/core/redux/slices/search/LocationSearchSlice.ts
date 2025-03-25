import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types for state
interface LocationSearchState {
  searchTerm: string;
  searchResults: any[]; // Change `any[]` to a more specific type if available
}

// Initial state with types
const initialState: LocationSearchState = {
  searchTerm: '',
  searchResults: [],
};

// Create the slice
export const locationSearchSlice = createSlice({
  name: 'locationSearch',
  initialState,
  reducers: {
    addSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    addSearchResults: (state, action: PayloadAction<any[]>) => {
      state.searchResults = action.payload;
    },
  },
});

// Export actions
export const { addSearchTerm, addSearchResults } = locationSearchSlice.actions;

// Export reducer
export default locationSearchSlice.reducer;
