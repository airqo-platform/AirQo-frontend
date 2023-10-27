import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getAllGridLocationsApi } from '@/core/apis/DeviceRegistry';

const initialState = {
    gridLocations: [],
    success: false,
    errors: null,
    selectedLocations: []
}

export const getAllGridLocations = createAsyncThunk('/get/grids', async ({ rejectWithValue }) => {
    try {
        const response = await getAllGridLocationsApi();
        console.log(response);
        return response;
    }
    catch (error) {
        if (!error.response) {
            throw error
        }
        return rejectWithValue(error.response)
    }
})

export const gridsSlice = createSlice({
    name: 'grids',
    initialState,
    reducers: {
        setSelectedLocations: (state, action) => {
            state.selectedLocations = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllGridLocations.fulfilled, (state, action) => {
                state.gridLocations = action.meta.arg;
                state.success = true;
            })
            .addCase(getAllGridLocations.pending, (state) => {
                state.success = false;
            })
            .addCase(getAllGridLocations.rejected, (state, action) => {
                state.errors = action.payload;
                state.success = action.payload;
            })
    }
})

export const { setSelectedLocations } = gridsSlice.actions
export default gridsSlice.reducer;