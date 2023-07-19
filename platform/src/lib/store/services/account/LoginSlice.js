import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { postUserLoginDetails } from '@/core/apis/Account';
import setAuthToken from '@/core/utils/setAuthToken';
import jwt_decode from 'jwt-decode';

const initialState = {
    userData: { userName: '', password: '' },
    userInfo: {},
    errors: null,
    success: false,
};

export const loginUser = createAsyncThunk('account/login', async (postData, { dispatch, rejectWithValue }) => {
    await postUserLoginDetails(postData)
        .then((res) => {
            const { token } = res;
            localStorage.setItem('jwtToken', token);
            setAuthToken(token);
            // Decode token to get user data
            const decoded = jwt_decode(token);
            localStorage.setItem('currentUser', JSON.stringify(decoded));
            dispatch(setUserInfo(decoded))
            dispatch(setSuccess(true))
        })
        .catch((error) => {
            dispatch(setSuccess(false))
            dispatch(setFailure(error.message))
            return rejectWithValue(error.message);
        })
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
        setUserInfo: (state, action) => {
            state.userInfo = action.payload
        },
        setFailure: (state, action) => {
            state.errors = action.payload
        },
        setSuccess: (state, action) => {
            state.success = action.payload
        }
    },
    // extraReducers: (builder) => {
    //     builder
    //         .addCase(loginUser.fulfilled, (state, action) => {
    //             state.userData = action.meta.arg;
    //             state.success = true;
    //         })
    //         .addCase(loginUser.pending, (state) => {
    //             state.success = false;
    //         })
    //         .addCase(loginUser.rejected, (state, action) => {
    //             state.errors = action.error.message;
    //             state.success = false;
    //         });
    // },
});

export const { setUserName, setUserPassword, setUserInfo, setFailure, setSuccess } =
    userLoginSlice.actions;

export default userLoginSlice.reducer;
