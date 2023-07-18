import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { postUserLoginDetails } from '@/core/apis/Account';

const initialState = {
    userData: { userName: '', password: '' },
    errors: null,
    success: false,
};

export const loginUser = createAsyncThunk('account/login', async (postData) => {
    const response = await postUserLoginDetails(postData)
    return response;
});

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
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.fulfilled, (state, action) => {
                state.userData = action.meta.arg;
                state.success = true;
            })
            .addCase(loginUser.pending, (state) => {
                state.success = false;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.errors = action.payload;
            });
    },
});

export const { setUserName, setUserPassword } =
    userLoginSlice.actions;

export default userLoginSlice.reducer;
