import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Site } from "./sitesSlice";

  export interface Grid {
    _id: string;
    visibility: boolean;
    name: string;
    admin_level: string;
    network: string;
    long_name: string;
    createdAt: string;
    sites: Site[];
  }
  
  export interface City {
    _id: string;
    visibility: boolean;
    name: string;
    region: string;
    country: string;
    latitude: number;
    longitude: number;
    grids: Grid[];
    createdAt: string;
    updatedAt?: string;
  }
  
  export interface CitiesState {
    cities: City[];
    isLoading: boolean;
    error: string | null;
  }
  const initialState: CitiesState = {
    cities: [],
    isLoading: false,
    error: null,
  };

  const citiesSlice = createSlice({
    name: "cities",
    initialState,
    reducers: {
      setCities(state, action: PayloadAction<City[]>) {
        state.cities = action.payload;
        state.isLoading = false;
        state.error = null;
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

export const { setCities, setLoading, setError } = citiesSlice.actions;
export default citiesSlice.reducer;
