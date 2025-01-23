import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllCleanAirApi } from '../../apis';
import i18n from 'i18next';

// Async thunk for fetching clean air data
export const fetchCleanAirData = createAsyncThunk(
  'tabs/fetchCleanAirData',
  async (lang, { rejectWithValue }) => {
    try {
      const response = await getAllCleanAirApi(lang);
      return response;
    } catch (err) {
      // If there's an error, pass it to the rejected action
      return rejectWithValue(err.response.data);
    }
  }
);

const initialState = {
  activeTab: 0,
  activeResource: i18n.t('cleanAirSite.publications.navs.toolkits'),
  airData: [],
  loading: false,
  error: null
};

// Slice for handling clean air data and tab states
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
        // Store the error message instead of the entire error object
        state.error = action.payload.message;
      });
  }
});

export const { setActiveTab, setActiveResource } = tabsSlice.actions;

export default tabsSlice.reducer;
