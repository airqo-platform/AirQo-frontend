import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Alert {
  message: string
  type: string
  visibility: boolean
}

interface DarkModeState {
  darkMode: boolean
  alert: Alert
}

const initialState: DarkModeState = {
  darkMode: false,
  alert: {
    message: '',
    type: '',
    visibility: false,
  },
}

const darkModeSlice = createSlice({
  name: 'darkMode',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload
    },
    setAlert: (state, action: PayloadAction<Alert>) => {
      state.alert = action.payload
    },
  },
})

export const { toggleDarkMode, setDarkMode, setAlert } = darkModeSlice.actions

export default darkModeSlice.reducer
