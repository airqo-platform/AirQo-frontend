import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchCleanAirData = createAsyncThunk('tabs/fetchCleanAirData', async () => {
  return null;
});

const initialState = {
  activeTab: 0,
  activeResource: 'toolkits',
  airData: [],
  loading: false,
  error: null
};

const tabsSlice = createSlice({
  name: 'cleanAir',
  initialState,
  reducers: {
    setActiveTab(state, action) {
      state.activeTab = action.payload;
    },
    setActiveResource(state, action) {
      state.activeResource = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCleanAirData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCleanAirData.fulfilled, (state, action) => {
        state.loading = false;
        state.airData = action.payload;
      })
      .addCase(fetchCleanAirData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { setActiveTab, setActiveResource } = tabsSlice.actions; // Export new reducer

export default tabsSlice.reducer;
