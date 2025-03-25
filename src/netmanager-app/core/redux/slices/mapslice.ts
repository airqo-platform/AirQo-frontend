import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types for state
interface Location {
  country: string;
  city: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface MapState {
  location: Location;
  center: Coordinates;
  zoom: number;
  showLocationDetails: boolean;
  selectedLocation: string | null;
  mapLoading: boolean;
  suggestedSites: any[]; // Adjust type if you have a specific shape for sites
  selectedNode: any | null; // Define a proper type if available
  selectedWeeklyPrediction: any | null; // Define a proper type if available
  mapReadingsData: any[]; // Define a proper type if available
  waqData: any[]; // Define a proper type if available
}

// Initial state with types
const initialState: MapState = {
  location: { country: '', city: '' },
  center: { latitude: 9.7037, longitude: 19.9573 },
  zoom: 3.27,
  showLocationDetails: false,
  selectedLocation: null,
  mapLoading: false,
  suggestedSites: [],
  selectedNode: null,
  selectedWeeklyPrediction: null,
  mapReadingsData: [],
  waqData: [],
};

// Create the slice
export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setSelectedWeeklyPrediction: (state, action: PayloadAction<any | null>) => {
      state.selectedWeeklyPrediction = action.payload;
    },
    setSelectedNode: (state, action: PayloadAction<any | null>) => {
      state.selectedNode = action.payload;
    },
    setCenter: (state, action: PayloadAction<Partial<Coordinates>>) => {
      const { latitude, longitude } = action.payload;
      if (latitude !== undefined && longitude !== undefined) {
        state.center = { latitude, longitude };
      }
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload;
    },
    setLocation: (state, action: PayloadAction<Partial<Location>>) => {
      state.location = {
        country: action.payload.country ?? '',
        city: action.payload.city ?? '',
      };
    },
    clearData: () => initialState, // Reset state completely
    reSetMap: (state) => {
      state.center = initialState.center;
      state.zoom = initialState.zoom;
      state.location = initialState.location;
    },
    setOpenLocationDetails: (state, action: PayloadAction<boolean>) => {
      state.showLocationDetails = action.payload;
    },
    setSelectedLocation: (state, action: PayloadAction<string | null>) => {
      state.selectedLocation = action.payload;
    },
    setMapLoading: (state, action: PayloadAction<boolean>) => {
      state.mapLoading = action.payload;
    },
    addSuggestedSites: (state, action: PayloadAction<any[]>) => {
      state.suggestedSites = action.payload;
    },
    setMapReadingsData: (state, action: PayloadAction<any[]>) => {
      state.mapReadingsData = action.payload;
    },
    setWaqData: (state, action: PayloadAction<any[]>) => {
      state.waqData = action.payload;
    },
  },
});

// Export actions
export const {
  setCenter,
  setZoom,
  setLocation,
  clearData,
  setOpenLocationDetails,
  setSelectedLocation,
  setMapLoading,
  addSuggestedSites,
  setSelectedNode,
  reSetMap,
  setSelectedWeeklyPrediction,
  setMapReadingsData,
  setWaqData,
} = mapSlice.actions;

// Export reducer
export default mapSlice.reducer;
