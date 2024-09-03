import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { newsletterSubscriptionApi } from '../../apis';

// Async thunk for loading newsletter data
export const loadNewsletterData = createAsyncThunk(
  'newsletter/loadNewsletterData',
  async (data, { rejectWithValue }) => {
    try {
      await newsletterSubscriptionApi(data);
      return { email: data.email, successful: true };
    } catch (err) {
      return rejectWithValue({ successful: false });
    }
  }
);

const newsletterSlice = createSlice({
  name: 'newsletter',
  initialState: {},
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadNewsletterData.fulfilled, (state, action) => {
        return action.payload;
      })
      .addCase(loadNewsletterData.rejected, (state, action) => {
        return action.payload;
      });
  }
});

export default newsletterSlice.reducer;
