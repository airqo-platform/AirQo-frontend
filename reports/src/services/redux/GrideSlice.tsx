import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { getGridsData } from '../apis/apis'
import { GridsData } from '../types'

interface GridState {
  data: GridsData[]
  loading: boolean
  error: string | null
}

const initialState: GridState = {
  data: [],
  loading: false,
  error: null,
}

export const fetchGridDataAsync = createAsyncThunk(
  'grid/fetchGridData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getGridsData()
      return response
    } catch (err) {
      if (err instanceof Error) {
        return rejectWithValue(err.message)
      }
      return rejectWithValue('An unknown error occurred')
    }
  },
)

const gridSlice = createSlice({
  name: 'grid',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGridDataAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        fetchGridDataAsync.fulfilled,
        (state, action: PayloadAction<GridsData>) => {
          state.loading = false
          state.data = [action.payload]
        },
      )
      .addCase(fetchGridDataAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? null
      })
  },
})

export default gridSlice.reducer
