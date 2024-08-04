import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getGridData } from '@/services/api';

// First, create the async thunk
export const fetchGrids = createAsyncThunk(
  'grids/fetchGrids',
  async (_, { getState }) => {
    const { grids } = (getState() as { grids: GridState }).grids;
    if (grids.length === 0) {
      const response = await getGridData();
      return response.grids;
    }
    return grids;
  }
);

interface GridState {
  grids: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: GridState = {
  grids: [],
  status: 'idle',
  error: null,
};

// Then, handle actions in your reducers:
const gridsSlice = createSlice({
  name: 'grids',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGrids.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGrids.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.status = 'succeeded';
        // Replace the existing grids with the fetched ones
        state.grids = action.payload;
      })
      .addCase(fetchGrids.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? null;
      });
  },
});

export default gridsSlice.reducer;
