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
    setUserName: (state, action) => {
      state.userData.userName = action.payload;
    },
    setUserPassword: (state, action) => {
      state.userData.password = action.payload;
    },
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
    },
    setFailure: (state, action) => {
      state.errors = action.payload;
    },
    setSuccess: (state, action) => {
      state.success = action.payload;
    },
    resetStore: (state) => {
      state.userData = { userName: '', password: '' };
      state.userInfo = {};
      state.errors = null;
      state.success = false;
    },
  },
});

export const { setUserName, setUserPassword, setUserInfo, setFailure, setSuccess, resetStore } =
  userLoginSlice.actions;

export default userLoginSlice.reducer;
