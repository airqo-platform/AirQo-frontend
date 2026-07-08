import forumReducer, {
  selectEvent,
  setActiveTab,
  setEvents,
} from '../forumSlice';

describe('forumSlice', () => {
  const initialState = {
    events: [],
    selectedEventIndex: 0,
    activeTab: 'About',
  };

  const mockEvents = [
    {
      id: 1,
      title: 'Event 1',
      unique_title: 'event-1',
      glossary_details: 'Details for event 1',
      sections: [],
    },
    {
      id: 2,
      title: 'Event 2',
      unique_title: 'event-2',
      glossary_details: 'Details for event 2',
      sections: [{ id: 1, title: 'Section 1' }],
    },
  ];

  describe('initial state', () => {
    it('should return the initial state', () => {
      expect(forumReducer(undefined, { type: 'unknown' })).toEqual(
        initialState,
      );
    });
  });

  describe('setEvents', () => {
    it('should set the events array', () => {
      const state = forumReducer(initialState, setEvents(mockEvents));
      expect(state.events).toEqual(mockEvents);
    });

    it('should replace existing events with new ones', () => {
      const newEvents = [
        {
          id: 3,
          title: 'Event 3',
          unique_title: 'event-3',
          glossary_details: 'Details for event 3',
          sections: [],
        },
      ];

      const stateWithEvents = forumReducer(initialState, setEvents(mockEvents));
      const updatedState = forumReducer(stateWithEvents, setEvents(newEvents));

      expect(updatedState.events).toEqual(newEvents);
      expect(updatedState.events).toHaveLength(1);
    });

    it('should handle empty events array', () => {
      const stateWithEvents = forumReducer(initialState, setEvents(mockEvents));
      const clearedState = forumReducer(stateWithEvents, setEvents([]));

      expect(clearedState.events).toEqual([]);
    });
  });

  describe('selectEvent', () => {
    it('should set the selected event index', () => {
      const stateWithEvents = forumReducer(initialState, setEvents(mockEvents));
      const state = forumReducer(stateWithEvents, selectEvent(1));

      expect(state.selectedEventIndex).toBe(1);
    });

    it('should reset activeTab to About', () => {
      const stateWithTab = forumReducer(initialState, setActiveTab('Details'));
      const state = forumReducer(stateWithTab, selectEvent(0));

      expect(state.activeTab).toBe('About');
    });

    it('should handle selecting index 0', () => {
      const stateWithEvents = forumReducer(initialState, setEvents(mockEvents));
      const state = forumReducer(stateWithEvents, selectEvent(0));

      expect(state.selectedEventIndex).toBe(0);
    });
  });

  describe('setActiveTab', () => {
    it('should set the active tab', () => {
      const state = forumReducer(initialState, setActiveTab('Details'));
      expect(state.activeTab).toBe('Details');
    });

    it('should replace an existing active tab', () => {
      const stateWithTab = forumReducer(initialState, setActiveTab('Details'));
      const updatedState = forumReducer(stateWithTab, setActiveTab('Stats'));

      expect(updatedState.activeTab).toBe('Stats');
    });
  });

  describe('selectEvent resets activeTab', () => {
    it('should reset activeTab to About when selecting an event', () => {
      let state = forumReducer(initialState, setActiveTab('Details'));
      expect(state.activeTab).toBe('Details');

      state = forumReducer(state, selectEvent(1));
      expect(state.activeTab).toBe('About');
    });

    it('should reset activeTab even if already on About', () => {
      const stateWithEvents = forumReducer(initialState, setEvents(mockEvents));
      const state = forumReducer(stateWithEvents, selectEvent(0));
      expect(state.activeTab).toBe('About');
    });
  });

  describe('reducer returns correct state', () => {
    it('should return a new state object for each action', () => {
      const state1 = forumReducer(initialState, setEvents(mockEvents));
      const state2 = forumReducer(state1, selectEvent(1));
      const state3 = forumReducer(state2, setActiveTab('Details'));

      expect(state1).not.toBe(initialState);
      expect(state2).not.toBe(state1);
      expect(state3).not.toBe(state2);
    });
  });
});
