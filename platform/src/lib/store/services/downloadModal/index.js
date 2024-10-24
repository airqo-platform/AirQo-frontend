import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  openModal: false,
  modalType: {
    type: '', // type of the modal
    ids: [], // selected ids for the modal
    data: [], // data is now an array of objects
  },
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    // Set whether the modal is open or closed
    setOpenModal(state, action) {
      state.openModal = action.payload;
    },
    // Set the modal type, ids, and optional data (which is an array)
    setModalType(state, action) {
      const { type, ids = [], data = [] } = action.payload;
      state.modalType = { type, ids, data };
    },
    // Update only the modal type (without changing ids or data)
    setModalText(state, action) {
      state.modalType.type = action.payload;
    },
    // Update only the ids associated with the modal
    setModalIds(state, action) {
      state.modalType.ids = action.payload;
    },
    // Update the data array by replacing it entirely with a new array of objects
    setModalData(state, action) {
      state.modalType.data = action.payload; // Expecting an array of objects
    },
    // Add a new object to the data array
    addModalData(state, action) {
      state.modalType.data.push(action.payload); // Add a new object to the data array
    },
    // Remove an object from the data array by index
    removeModalData(state, action) {
      const index = action.payload; // Expecting the index of the item to remove
      if (index >= 0 && index < state.modalType.data.length) {
        state.modalType.data.splice(index, 1); // Remove the object at the specified index
      }
    },
    // Reset the modal state back to the initial state
    resetModalState(state) {
      state.openModal = false;
      state.modalType = initialState.modalType;
    },
  },
});

export const {
  setOpenModal,
  setModalType,
  setModalText,
  setModalIds,
  setModalData,
  addModalData,
  removeModalData,
  resetModalState,
} = modalSlice.actions;

export default modalSlice.reducer;
