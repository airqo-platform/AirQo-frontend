import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { requestDataAccessApi } from '../../apis';

// Async thunk for posting explore data request
export const postExploreDataRequest = createAsyncThunk(
  'exploreData/postExploreDataRequest',
  async (data, { rejectWithValue }) => {
    try {
      await requestDataAccessApi(data);
      return { ...data, success: true };
    } catch (err) {
      console.log(err);
      return rejectWithValue({ success: false });
    }
  }
);

const exploreDataSlice = createSlice({
  name: 'exploreData',
  initialState: {
    userType: {
      individual: false,
      organization: false
    },
    category: '',
    firstName: null,
    lastName: null,
    long_organization: null,
    jobTitle: null,
    email: null,
    success: false,
    openModal: false,
    error: null
  },
  reducers: {
    updateExploreData: (state, action) => {
      return { ...state, ...action.payload };
    },
    showExploreDataModal: (state, action) => {
      state.openModal = action.payload.openModal;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(postExploreDataRequest.fulfilled, (state, action) => {
        return { ...state, ...action.payload };
      })
      .addCase(postExploreDataRequest.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { updateExploreData, showExploreDataModal } = exploreDataSlice.actions;

export default exploreDataSlice.reducer;
