import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  openModal: false,
  modalType: {
    type: '',
    ids: [],
    data: [],
    backToDownload: false,
    fromMoreInsights: false,
    filterType: null, // Track the type of filter (sites, countries, cities, devices)
    modalTitle: 'Air Quality Insights', // Custom title for the modal
    originalSelection: [], // Track original user selection for context
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
      const {
        type,
        ids = [],
        data = [],
        backToDownload = false,
        fromMoreInsights = false,
        filterType = null,
        modalTitle = 'Air Quality Insights',
        originalSelection = [],
      } = action.payload;
      state.modalType = {
        type,
        ids,
        data,
        backToDownload,
        fromMoreInsights,
        filterType,
        modalTitle,
        originalSelection,
      };
    },
    setModalText(state, action) {
      state.modalType.type = action.payload;
    },
    setModalIds(state, action) {
      state.modalType.ids = action.payload;
    },
    setModalData(state, action) {
      state.modalType.data = action.payload;
    },
    addModalData(state, action) {
      state.modalType.data.push(action.payload);
    },
    removeModalData(state, action) {
      const index = action.payload;
      if (index >= 0 && index < state.modalType.data.length) {
        state.modalType.data.splice(index, 1);
      }
    },
    resetModalState(state) {
      state.openModal = false;
      state.modalType = {
        ...initialState.modalType,
        fromMoreInsights: false,
        filterType: null,
        modalTitle: 'Air Quality Insights',
        originalSelection: [],
      };
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
