import { createSlice } from '@reduxjs/toolkit';
import { getAllEventsApi } from '../../apis';
import { isEmpty } from 'underscore';

export const getAllEvents = () => async (dispatch) => {
  await getAllEventsApi()
    .then((res) => {
      if (isEmpty(res || [])) return;
      dispatch(getEventsReducer(res));
    })
    .catch((err) => dispatch(getEventsFailure(err.message)));
};

export const eventSlice = createSlice({
  name: 'getEvents',
  initialState: {
    loading: false,
    events: [],
    errorMessage: ''
  },
  reducers: {
    getEventsReducer: (state, action) => {
      state.events = action.payload;
    },
    getEventsFailure: (state, action) => {
      state.errorMessage = action.payload;
    }
  },
  extraReducers: {
    [getAllEvents.pending]: (state) => {
      state.loading = true;
    },
    [getAllEvents.fulfilled]: (state, action) => {
      state.events = action.payload;
      state.loading = false;
    }
  }
});

export const { getEventsReducer, getEventsFailure } = eventSlice.actions;

export default eventSlice.reducer;
