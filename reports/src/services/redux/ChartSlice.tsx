import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ChartState {
  isLoading: boolean
}

const initialState: ChartState = {
  isLoading: true,
}

const chartSlice = createSlice({
  name: 'chart',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
  },
})

export const { setLoading } = chartSlice.actions

export default chartSlice.reducer
