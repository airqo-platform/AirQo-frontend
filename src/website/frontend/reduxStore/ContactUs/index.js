import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { contactUsApi } from '../../apis';

// Async thunk for posting contact us inquiry
export const postContactUsInquiry = createAsyncThunk(
  'inquiry/postContactUsInquiry',
  async (data, { rejectWithValue }) => {
    try {
      await contactUsApi(data);
      return {
        fullName: data.fullName,
        email: data.email,
        message: data.message,
        category: data.category,
        success: true
      };
    } catch (err) {
      return rejectWithValue({ success: false });
    }
  }
);

const inquirySlice = createSlice({
  name: 'inquiry',
  initialState: {},
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postContactUsInquiry.fulfilled, (state, action) => {
        return action.payload;
      })
      .addCase(postContactUsInquiry.rejected, (state, action) => {
        return action.payload;
      });
  }
});

export default inquirySlice.reducer;
