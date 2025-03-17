// redux/forumSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ForumEvent {
  id: number;
  title: string;
  unique_title: string;
  glossary_details: string;
  sections: any[];
  // ... add additional fields as needed
}

interface ForumState {
  events: ForumEvent[];
  selectedEventIndex: number;
  activeTab: string;
}

const initialState: ForumState = {
  events: [],
  selectedEventIndex: 0,
  activeTab: 'About',
};

const forumSlice = createSlice({
  name: 'forum',
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<ForumEvent[]>) => {
      state.events = action.payload;
    },
    selectEvent: (state, action: PayloadAction<number>) => {
      state.selectedEventIndex = action.payload;
      state.activeTab = 'About';
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
  },
});

export const { setEvents, selectEvent, setActiveTab } = forumSlice.actions;
export default forumSlice.reducer;
