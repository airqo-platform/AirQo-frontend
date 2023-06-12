import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllCitiesApi } from '../../apis';

export const getAllCities = createAsyncThunk('/getCities', async () => {
  const response = await getAllCitiesApi();
  return response;
});

export const citiesSlice = createSlice({
  name: 'africanCities',
  initialState: {
    loading: false,
    cities: [],
    errorMessage: ''
  },
  reducers: {
    isLoading: (state, action) => {
      state.loading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllCities.fulfilled, (state, action) => {
        state.cities = action.payload;
        state.loading = false;
      })
      .addCase(getAllCities.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllCities.rejected, (state, action) => {
        state.errorMessage = action.error.message;
        state.loading = false;
      });
  }
});

export const { isLoading } = citiesSlice.actions;

export default citiesSlice.reducer;
