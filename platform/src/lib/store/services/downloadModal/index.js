import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  openModal: false,
  modalType: {
    type: '',
    ids: [],
  },
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    setOpenModal(state, action) {
      state.openModal = action.payload;
    },
    setModalType(state, action) {
      state.modalType = action.payload;
    },
    setModalText(state, action) {
      state.modalType.type = action.payload;
    },
    setModalIds(state, action) {
      state.modalType.ids = action.payload;
    },
  },
});

export const { setOpenModal, setModalType, setModalText, setModalIds } =
  modalSlice.actions;

export default modalSlice.reducer;
