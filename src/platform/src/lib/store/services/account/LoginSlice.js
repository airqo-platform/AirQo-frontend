import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userData: { userName: '', password: '' },
  userInfo: {},
  errors: null,
  success: false,
};

export const userLoginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setUserData: (state, { payload: { key, value } }) => {
      state.userData[key] = value;
    },
    setUserInfo: (state, { payload }) => {
      state.userInfo = payload;
    },
    setError: (state, { payload }) => {
      state.errors = payload;
    },
    setSuccess: (state, { payload }) => {
      state.success = payload;
    },
    resetStore: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase({ type: 'RESET_APP' }, () => initialState)
      .addCase({ type: 'LOGOUT_USER' }, () => initialState);
  },
});

export const { setUserData, setUserInfo, setError, setSuccess, resetStore } =
  userLoginSlice.actions;

export default userLoginSlice.reducer;
