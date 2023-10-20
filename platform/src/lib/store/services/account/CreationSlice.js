import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { postUserCreationDetails } from '@/core/apis/Account';

const initialState = {
  userData: { firstName: '', lastName: '', email: '', },
  password: '',
  errors: null,
  success: false,
};

export const createUser = createAsyncThunk('account/creation', async (postData, { rejectWithValue }) => {
  // const appendedData = {
  //   organization: 'airqo',
  //   long_organization: 'clean air for all African cities',
  //   privilege: 'admin',
  // };
  // const createUserData = { ...postData, ...appendedData };
  try {
    const response = await postUserCreationDetails(postData);
    return response
  } catch (error) {
    if (!error.response) {
      throw error
    }
    return rejectWithValue(error.response.data);
  }
});

export const createAccountSlice = createSlice({
  name: 'creation',
  initialState,
  reducers: {
    setUserEmail: (state, action) => {
      state.userData.email = action.payload;
    },
    setUserFirstName: (state, action) => {
      state.userData.firstName = action.payload;
    },
    setUserLastName: (state, action) => {
      state.userData.lastName = action.payload;
    },
    setUserPassword: (state, action) => {
      state.password = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUser.fulfilled, (state, action) => {
        state.userData = action.meta.arg;
        state.success = true;
      })
      .addCase(createUser.pending, (state) => {
        state.success = false;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.errors = action.payload.errors;
        state.success = action.payload.success;
      });
  },
});

export const { setUserEmail, setUserFirstName, setUserLastName, setUserPassword } =
  createAccountSlice.actions;

export default createAccountSlice.reducer;
