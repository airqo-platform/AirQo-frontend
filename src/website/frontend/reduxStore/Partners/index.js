import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { isEmpty } from 'underscore';
import { getAllPartnersApi } from '../../apis';
import { useSelector } from 'react-redux';

// Async thunk for loading partners data
export const loadPartnersData = createAsyncThunk(
  'partnersData/loadPartnersData',
  async (_, { getState, rejectWithValue }) => {
    const lang = getState().eventsNavTab.languageTab;
    try {
      const resData = await getAllPartnersApi(lang);
      if (isEmpty(resData || [])) return;
      return resData;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const partnersDataSlice = createSlice({
  name: 'partnersData',
  initialState: {
    partners: [],
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadPartnersData.fulfilled, (state, action) => {
        state.partners = action.payload;
      })
      .addCase(loadPartnersData.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

// Selectors
export const usePartnersData = () => useSelector((state) => state.partnersData.partners);

export default partnersDataSlice.reducer;
