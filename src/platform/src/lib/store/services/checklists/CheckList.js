import { createSlice } from '@reduxjs/toolkit';

// Define the initial state of each card
const initialCardState = {
  status: 'not started',
  completed: false,
  completionDate: null,
  videoProgress: 0,
  title: '',
};

// Define the initial state of the slice
const initialState = {
  cards: Array(4)
    .fill()
    .map((_, i) => ({ id: i + 1, ...initialCardState })),
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
        card.completed = true;
        card.completionDate = new Date().toISOString();
      }
    },
    resetTask: (state, action) => {
      const card = state.cards.find((card) => card.id === action.payload);
      if (card) {
        Object.assign(card, initialCardState);
      }
    },
    resetAllTasks: (state) => {
      state.cards.forEach((card) => {
        Object.assign(card, initialCardState);
      });
    },
    updateVideoProgress: (state, action) => {
      const { id, videoProgress } = action.payload;
      const card = state.cards.find((card) => card.id === id);
      if (card) {
        card.videoProgress = videoProgress;
      }
    },
    updateTitle: (state, action) => {
      const { id, title } = action.payload;
      const card = state.cards.find((card) => card.id === id);
      if (card) {
        card.title = title;
      }
    },
    updateCards: (state, action) => {
      action.payload.forEach((updatedCard, index) => {
        const card = state.cards.find((card) => card.id === index + 1);
        if (card) {
          Object.assign(card, updatedCard);
        }
      });
    },
  },
});

export const {
  startTask,
  completeTask,
  resetTask,
  resetAllTasks,
  updateTitle,
  updateVideoProgress,
  updateCards,
} = cardSlice.actions;

export default cardSlice.reducer;
