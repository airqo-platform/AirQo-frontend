import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MapSettings {
  mapStyle: string; // Mapbox style URL
  nodeType: 'emoji' | 'heatmap' | 'node' | 'number';
}

const initialState: MapSettings = {
  mapStyle: 'mapbox://styles/mapbox/streets-v12',
  nodeType: 'emoji',
};

const mapSettingsSlice = createSlice({
  name: 'mapSettings',
  initialState,
  reducers: {
    setMapStyle: (state, action: PayloadAction<string>) => {
      state.mapStyle = action.payload;
    },
    setNodeType: (
      state,
      action: PayloadAction<'emoji' | 'heatmap' | 'node' | 'number'>
    ) => {
      state.nodeType = action.payload;
    },
    setMapSettings: (state, action: PayloadAction<MapSettings>) => {
      state.mapStyle = action.payload.mapStyle;
      state.nodeType = action.payload.nodeType;
    },
  },
});

export const { setMapStyle, setNodeType, setMapSettings } =
  mapSettingsSlice.actions;
export default mapSettingsSlice.reducer;
