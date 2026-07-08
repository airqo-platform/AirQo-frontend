import modalReducer, {
  closeModal,
  openModal,
  toggleModal,
} from '../modalSlice';

describe('modalSlice', () => {
  const initialState = {
    isOpen: false,
  };

  describe('initial state', () => {
    it('should return the initial state', () => {
      expect(modalReducer(undefined, { type: 'unknown' })).toEqual(
        initialState,
      );
    });
  });

  describe('openModal', () => {
    it('should set isOpen to true', () => {
      const state = modalReducer(initialState, openModal());
      expect(state.isOpen).toBe(true);
    });

    it('should keep isOpen true if already open', () => {
      const stateWithOpen = modalReducer(initialState, openModal());
      const state = modalReducer(stateWithOpen, openModal());
      expect(state.isOpen).toBe(true);
    });
  });

  describe('closeModal', () => {
    it('should set isOpen to false', () => {
      const stateWithOpen = modalReducer(initialState, openModal());
      const state = modalReducer(stateWithOpen, closeModal());
      expect(state.isOpen).toBe(false);
    });

    it('should keep isOpen false if already closed', () => {
      const state = modalReducer(initialState, closeModal());
      expect(state.isOpen).toBe(false);
    });
  });

  describe('toggleModal', () => {
    it('should toggle isOpen from false to true', () => {
      const state = modalReducer(initialState, toggleModal());
      expect(state.isOpen).toBe(true);
    });

    it('should toggle isOpen from true to false', () => {
      const stateWithOpen = modalReducer(initialState, openModal());
      const state = modalReducer(stateWithOpen, toggleModal());
      expect(state.isOpen).toBe(false);
    });

    it('should handle multiple toggles', () => {
      let state = modalReducer(initialState, toggleModal());
      expect(state.isOpen).toBe(true);

      state = modalReducer(state, toggleModal());
      expect(state.isOpen).toBe(false);

      state = modalReducer(state, toggleModal());
      expect(state.isOpen).toBe(true);

      state = modalReducer(state, toggleModal());
      expect(state.isOpen).toBe(false);
    });
  });

  describe('reducer returns correct state', () => {
    it('should return a new state object for each action', () => {
      const state1 = modalReducer(initialState, openModal());
      const state2 = modalReducer(state1, closeModal());
      expect(state1).not.toBe(initialState);
      expect(state2).not.toBe(state1);
    });
  });
});
