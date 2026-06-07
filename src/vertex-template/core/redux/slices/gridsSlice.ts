import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Grid } from "@/app/types/grids";

export type Position = [number, number]; // Represents a coordinate as [longitude, latitude]

export interface GridsState {
  grids: Grid[];
  activeGrid: Grid[] | null;
  isLoading: boolean;
  error: string | null;
  polygon: {
    type: "MultiPolygon" | "Polygon";
    coordinates: Position[][] | Position[][][] | null;
  };
}
const initialState: GridsState = {
  grids: [],
  activeGrid: null,
  isLoading: false,
  error: null,
  polygon: {
    type: "Polygon",
    coordinates: null,
  },
};

const gridsSlice = createSlice({
  name: "grids",
  initialState,
  reducers: {
    setGrids(state, action: PayloadAction<Grid[]>) {
      state.grids = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setActiveCohort(state: GridsState, action: PayloadAction<Grid[]>) {
      state.activeGrid = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.isLoading = false;
    },
    setPolygon(
      state,
      action: PayloadAction<{
        type: "MultiPolygon" | "Polygon";
        coordinates: Position[][] | Position[][][] | null;
      }>
    ) {
      state.polygon = action.payload;
    },
  },
});

export const { setGrids, setActiveCohort, setLoading, setError, setPolygon } =
  gridsSlice.actions;
export default gridsSlice.reducer;
