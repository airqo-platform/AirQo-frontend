import { createSlice } from '@reduxjs/toolkit';
import { getAllPressApi } from '../../apis';

const initialState = {
  loading: false,
  press: [],
  error: null
};

const pressSlice = createSlice({
  name: 'press',
  initialState,
  reducers: {
    loadPressSuccess(state, action) {
      state.press = action.payload;
      state.loading = false;
      state.error = null;
    },
    loadPressFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    startLoading(state) {
      state.loading = true;
    }
  }
});

export const { loadPressSuccess, loadPressFailure, startLoading } = pressSlice.actions;

export default pressSlice.reducer;

export const loadPressData = () => async (dispatch) => {
  try {
    dispatch(startLoading());
    const resData = await getAllPressApi();
    dispatch(loadPressSuccess(resData));
  } catch (err) {
    dispatch(loadPressFailure(err.message));
  }
};
