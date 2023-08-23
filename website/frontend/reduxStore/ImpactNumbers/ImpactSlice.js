import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllImpactNumbersApi } from '../../apis';

export const getAllImpactNumbers = createAsyncThunk('/getImpactNumbers', async () => {
    const response = await getAllImpactNumbersApi();
    return response;
});

export const impactSlice = createSlice({
    name: 'impactNumbers',
    initialState: {
        loading: false,
        numbers: [],
        errorMessage: ''
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllImpactNumbers.fulfilled, (state, action) => {
                state.numbers = action.payload;
                state.loading = false;
            })
            .addCase(getAllImpactNumbers.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllImpactNumbers.rejected, (state, action) => {
                state.errorMessage = action.error.message;
                state.loading = false;
            });
    }
});

export default impactSlice.reducer;
