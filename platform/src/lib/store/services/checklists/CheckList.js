import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cards: [
    { id: 1, status: 'notStarted' },
    { id: 2, status: 'notStarted' },
    { id: 3, status: 'notStarted' },
    { id: 4, status: 'notStarted' },
  ],
  videoTime: 0,
};

export const cardSlice = createSlice({
  name: 'cardChecklist',
  initialState,
  reducers: {
    startTask: (state, action) => {
      const card = state.cards.find((card) => card.id === action.payload);
      if (card) {
        card.status = 'inProgress';
      }
    },
    completeTask: (state, action) => {
      const card = state.cards.find((card) => card.id === action.payload);
      if (card) {
        card.status = 'completed';
      }
    },
    resetTask: (state, action) => {
      const card = state.cards.find((card) => card.id === action.payload);
      if (card) {
        card.status = 'notStarted';
      }
    },
    resetAllTasks: (state) => {
      state.cards.forEach((card) => {
        card.status = 'notStarted';
      });
    },
    setVideoTime: (state, action) => {
      state.videoTime = action.payload;
    },
  },
});

export const { startTask, completeTask, resetTask, resetAllTasks, setVideoTime } =
  cardSlice.actions;

export default cardSlice.reducer;
