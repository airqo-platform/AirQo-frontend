import { postUserDefaultsApi, postUserPreferencesApi, updateUserDefaultsApi, updateUserPreferencesApi } from '@/core/apis/Account';
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

export const postUserPreferences = createAsyncThunk('/post/preferences', async (data, { rejectWithValue })=>{
    try {
        const response = await postUserPreferencesApi(data);
        return response;
    } catch (error) {
        if (!error.response) {
            throw error
        }
        return rejectWithValue(error.response.data);
    }
})

export const updateUserPreferences = createAsyncThunk('/update/preferences', async (data, { rejectWithValue }) => {
    try {
        const response = await updateUserPreferencesApi(data);
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
            .addCase(postUserPreferences.fulfilled, (state, action) => {
                state.post_response = action.payload;
                state.success = action.payload.success;
            })
            .addCase(postUserPreferences.pending, (state) => {
                state.success = false;
            })
            .addCase(postUserPreferences.rejected, (state, action) => {
                state.errors = action.payload;
                state.success = false;
            })
            .addCase(updateUserPreferences.fulfilled, (state, action) => {
                state.update_response = action.payload;
                state.success = action.payload.success;
            })
            .addCase(updateUserPreferences.pending, (state) => {
                state.success = false;
            })
            .addCase(updateUserPreferences.rejected, (state, action) => {
                state.errors = action.payload;
                state.success = false;
            })
        }
})

export const { setCustomisedLocations } = defaultsSlice.actions
export default defaultsSlice.reducer;