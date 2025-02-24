import { createSlice } from '@reduxjs/toolkit';

// Slice
const getInvolvedSlice = createSlice({
  name: 'getInvolved',
  initialState: {
    openModal: false,
    category: '',
    complete: false,
    slide: 0,
    firstName: null,
    lastName: null,
    email: null,
    acceptedTerms: false
  },
  reducers: {
    getInvolvedRegistrationSuccess: (state) => {
      state.complete = true;
    },
    showGetInvolvedModal: (state, action) => {
      state.openModal = action.payload.openModal;
    },
    updateGetInvolvedData: (state, action) => {
      return { ...state, ...action.payload };
    }
  }
});

export const { getInvolvedRegistrationSuccess, showGetInvolvedModal, updateGetInvolvedData } =
  getInvolvedSlice.actions;

export default getInvolvedSlice.reducer;
