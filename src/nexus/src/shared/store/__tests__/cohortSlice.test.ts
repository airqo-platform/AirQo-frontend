import type { Reducer } from '@reduxjs/toolkit';
import reducer, {
  setCohortsLoading,
  setCohortsError,
  setActiveGroupCohorts,
  clearCohorts,
} from '../cohortSlice';
import type { CohortState } from '../cohortSlice';

const cohortReducer = reducer as Reducer<CohortState>;

const initialState: CohortState = {
  activeGroupCohorts: [],
  isLoading: false,
  error: null,
  lastFetchedGroupId: null,
};

describe('cohortSlice', () => {
  it('returns the initial state', () => {
    expect(cohortReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setCohortsLoading', () => {
    it('sets isLoading true', () => {
      const state = cohortReducer(initialState, setCohortsLoading(true));
      expect(state.isLoading).toBe(true);
    });

    it('sets isLoading false', () => {
      const stateWithLoading = { ...initialState, isLoading: true };
      const state = cohortReducer(stateWithLoading, setCohortsLoading(false));
      expect(state.isLoading).toBe(false);
    });

    it('does not affect other state', () => {
      const populatedState: CohortState = {
        activeGroupCohorts: ['c1'],
        isLoading: false,
        error: 'old error',
        lastFetchedGroupId: 'g1',
      };
      const state = cohortReducer(populatedState, setCohortsLoading(true));
      expect(state.isLoading).toBe(true);
      expect(state.activeGroupCohorts).toEqual(['c1']);
      expect(state.error).toBe('old error');
      expect(state.lastFetchedGroupId).toBe('g1');
    });
  });

  describe('setCohortsError', () => {
    it('sets error and isLoading false', () => {
      const state = cohortReducer(
        { ...initialState, isLoading: true },
        setCohortsError('fetch failed')
      );
      expect(state.error).toBe('fetch failed');
      expect(state.isLoading).toBe(false);
    });

    it('null clears error', () => {
      const stateWithError = { ...initialState, error: 'old error' };
      const state = cohortReducer(stateWithError, setCohortsError(null));
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setActiveGroupCohorts', () => {
    it('sets cohortIds, lastFetchedGroupId, clears error, isLoading false', () => {
      const state = cohortReducer(
        { ...initialState, isLoading: true, error: 'old error' },
        setActiveGroupCohorts({ groupId: 'g1', cohortIds: ['c1', 'c2'] })
      );
      expect(state.activeGroupCohorts).toEqual(['c1', 'c2']);
      expect(state.lastFetchedGroupId).toBe('g1');
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it('works with empty cohortIds', () => {
      const state = cohortReducer(
        initialState,
        setActiveGroupCohorts({ groupId: 'g1', cohortIds: [] })
      );
      expect(state.activeGroupCohorts).toEqual([]);
      expect(state.lastFetchedGroupId).toBe('g1');
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it('called twice replaces previous data', () => {
      const state1 = cohortReducer(
        initialState,
        setActiveGroupCohorts({ groupId: 'g1', cohortIds: ['c1', 'c2'] })
      );
      const state2 = cohortReducer(
        state1,
        setActiveGroupCohorts({ groupId: 'g2', cohortIds: ['c3'] })
      );
      expect(state2.activeGroupCohorts).toEqual(['c3']);
      expect(state2.lastFetchedGroupId).toBe('g2');
    });
  });

  describe('clearCohorts', () => {
    it('resets all state', () => {
      const populatedState: CohortState = {
        activeGroupCohorts: ['c1', 'c2'],
        isLoading: true,
        error: 'some error',
        lastFetchedGroupId: 'g1',
      };
      const state = cohortReducer(populatedState, clearCohorts());
      expect(state).toEqual(initialState);
    });

    it('on already-clean state', () => {
      const state = cohortReducer(initialState, clearCohorts());
      expect(state).toEqual(initialState);
    });
  });
});
