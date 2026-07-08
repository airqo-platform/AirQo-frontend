import countryReducer, {
  clearSelectedCountry,
  setSelectedCountry,
} from '../countrySlice';

describe('countrySlice', () => {
  const initialState = {
    selectedCountry: null,
  };

  const mockCountry = {
    name: 'Uganda',
    long_name: 'Republic of Uganda',
    flag: '🇺🇬',
    _id: '123',
  };

  describe('initial state', () => {
    it('should return the initial state', () => {
      expect(countryReducer(undefined, { type: 'unknown' })).toEqual(
        initialState,
      );
    });
  });

  describe('setSelectedCountry', () => {
    it('should set the selected country', () => {
      const state = countryReducer(
        initialState,
        setSelectedCountry(mockCountry),
      );
      expect(state.selectedCountry).toEqual(mockCountry);
    });

    it('should replace an existing selected country', () => {
      const newCountry = {
        name: 'Kenya',
        long_name: 'Republic of Kenya',
        flag: '🇰🇪',
        _id: '456',
      };

      const stateWithCountry = countryReducer(
        initialState,
        setSelectedCountry(mockCountry),
      );
      const updatedState = countryReducer(
        stateWithCountry,
        setSelectedCountry(newCountry),
      );

      expect(updatedState.selectedCountry).toEqual(newCountry);
    });
  });

  describe('clearSelectedCountry', () => {
    it('should clear the selected country to null', () => {
      const stateWithCountry = countryReducer(
        initialState,
        setSelectedCountry(mockCountry),
      );
      const clearedState = countryReducer(
        stateWithCountry,
        clearSelectedCountry(),
      );

      expect(clearedState.selectedCountry).toBeNull();
    });

    it('should handle clearing when no country is selected', () => {
      const clearedState = countryReducer(initialState, clearSelectedCountry());
      expect(clearedState.selectedCountry).toBeNull();
    });
  });

  describe('reducer returns correct state', () => {
    it('should return a new state object for setSelectedCountry', () => {
      const state = countryReducer(
        initialState,
        setSelectedCountry(mockCountry),
      );
      expect(state).not.toBe(initialState);
    });

    it('should return a new state object for clearSelectedCountry', () => {
      const stateWithCountry = countryReducer(
        initialState,
        setSelectedCountry(mockCountry),
      );
      const clearedState = countryReducer(
        stateWithCountry,
        clearSelectedCountry(),
      );
      expect(clearedState).not.toBe(stateWithCountry);
    });
  });
});
