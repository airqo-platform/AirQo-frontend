import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getAllGridLocationsApi, getSiteSummaryDetails } from '@/core/apis/DeviceRegistry';

const initialState = {
    gridLocations: [],
    sitesSummary:[],
    success: false,
    errors: null,
    selectedLocations: []
}

export const getAllGridLocations = createAsyncThunk('/get/grids', async () => {
    const response = await getAllGridLocationsApi();
    return response;
})

export const getSitesSummary = createAsyncThunk('/get/sites-summary', async () => {
    const response = await getSiteSummaryDetails();
    return response
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
                state.gridLocations = action.payload.grids;
                state.success = action.payload.success;
            })
            .addCase(getAllGridLocations.pending, (state) => {
                state.success = false;
            })
            .addCase(getAllGridLocations.rejected, (state, action) => {
                state.errors = action.payload;
                state.success = action.payload.success;
            })
            .addCase(getSitesSummary.fulfilled, (state, action) => {
                state.sitesSummary = action.payload;
                state.success = action.payload.success;
            })
            .addCase(getSitesSummary.pending, (state) => {
                state.success = false;
            })
            .addCase(getSitesSummary.rejected, (state, action) => {
                state.errors = action.payload;
                state.success = action.payload.success;
            })
    }
})

export const { setSelectedLocations } = gridsSlice.actions
export default gridsSlice.reducer;