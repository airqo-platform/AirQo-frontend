import { postUserDefaultsApi, updateUserDefaultsApi } from '@/core/apis/Account';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const initialState = {
    locationsData: {
        user_id: '',
        sites: []
    },
    success: false,
    errors: null,
    update_response:[],
    post_response:[]
}

export const postUserDefaults = createAsyncThunk('/post/defaults', async (data, { rejectWithValue })=>{
    try {
        const response = await postUserDefaultsApi(data);
        return response;
    } catch (error) {
        if (!error.response) {
            throw error
        }
        return rejectWithValue(error.response.data);
    }
})

export const updateUserDefaults = createAsyncThunk('/update/defaults', async (data, { rejectWithValue }) => {
    try {
        const response = await updateUserDefaultsApi(data);
        return response
    } catch (error) {
        if (!error.response) {
            throw error
        }
        return rejectWithValue(error.response.data);
    }
})

export const defaultsSlice = createSlice({
    name: 'defaults',
    initialState,
    reducers: {
        setCustomisedLocations: (state, action) => {
            state.locationsData = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(postUserDefaults.fulfilled, (state, action) => {
                state.post_response = action.payload;
                state.success = action.payload.success;
            })
            .addCase(postUserDefaults.pending, (state) => {
                state.success = false;
            })
            .addCase(postUserDefaults.rejected, (state, action) => {
                state.errors = action.payload;
                state.success = false;
            })
            .addCase(updateUserDefaults.fulfilled, (state, action) => {
                state.update_response = action.payload;
                state.success = action.payload.success;
            })
            .addCase(updateUserDefaults.pending, (state) => {
                state.success = false;
            })
            .addCase(updateUserDefaults.rejected, (state, action) => {
                state.errors = action.payload;
                state.success = false;
            })
        }
})

export const { setCustomisedLocations } = defaultsSlice.actions
export default defaultsSlice.reducer;