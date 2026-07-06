import type { Reducer } from '@reduxjs/toolkit';
import reducer, {
  openDialog,
  closeDialog,
  closeTopDialog,
  closeAllDialogs,
  setSelectedSites,
  addSelectedSite,
  removeSelectedSite,
  toggleSelectedSite,
  clearSelectedSites,
  setLoading,
  setError,
  openMoreInsights,
  openAddLocation,
} from '../insightsSlice';
import type { InsightsState, DialogItem, SelectedSite } from '../insightsSlice';

const insightsReducer = reducer as Reducer<InsightsState>;

const initialState: InsightsState = {
  dialogStack: [],
  selectedSites: [],
  isLoading: false,
  error: null,
};

const site1: SelectedSite = { _id: 's1', name: 'Site A' };
const site2: SelectedSite = { _id: 's2', name: 'Site B' };
const dialog1: DialogItem = { id: 'd1', type: 'more-insights' };
const dialog2: DialogItem = { id: 'd2', type: 'add-location' };
const dialogWithData: DialogItem = {
  id: 'd3',
  type: 'more-insights',
  data: { key: 'value' },
};

describe('insightsSlice', () => {
  it('returns the initial state', () => {
    expect(insightsReducer(undefined, { type: 'unknown' })).toEqual(
      initialState
    );
  });

  describe('openDialog', () => {
    it('adds to stack', () => {
      const state = insightsReducer(initialState, openDialog(dialog1));
      expect(state.dialogStack).toEqual([dialog1]);
    });

    it('moves existing to top if already in stack', () => {
      const stateWithDialogs = {
        ...initialState,
        dialogStack: [dialog1, dialog2],
      };
      const state = insightsReducer(stateWithDialogs, openDialog(dialog1));
      expect(state.dialogStack).toEqual([dialog2, dialog1]);
    });

    it('handles dialog with data field', () => {
      const state = insightsReducer(initialState, openDialog(dialogWithData));
      expect(state.dialogStack).toEqual([dialogWithData]);
      expect(state.dialogStack[0].data).toEqual({ key: 'value' });
    });

    it('is idempotent when dialog is already at top', () => {
      const stateWithDialogs = {
        ...initialState,
        dialogStack: [dialog2, dialog1],
      };
      const state = insightsReducer(stateWithDialogs, openDialog(dialog1));
      expect(state.dialogStack).toEqual([dialog2, dialog1]);
      expect(state.dialogStack).toHaveLength(2);
    });
  });

  describe('closeDialog', () => {
    it('removes specific dialog', () => {
      const stateWithDialogs = {
        ...initialState,
        dialogStack: [dialog1, dialog2],
      };
      const state = insightsReducer(stateWithDialogs, closeDialog('d1'));
      expect(state.dialogStack).toEqual([dialog2]);
    });

    it('no-op on nonexistent ID', () => {
      const stateWithDialogs = {
        ...initialState,
        dialogStack: [dialog1, dialog2],
      };
      const state = insightsReducer(
        stateWithDialogs,
        closeDialog('nonexistent')
      );
      expect(state.dialogStack).toEqual([dialog1, dialog2]);
    });
  });

  describe('closeTopDialog', () => {
    it('removes last dialog', () => {
      const stateWithDialogs = {
        ...initialState,
        dialogStack: [dialog1, dialog2],
      };
      const state = insightsReducer(stateWithDialogs, closeTopDialog());
      expect(state.dialogStack).toEqual([dialog1]);
    });

    it('no-op on empty stack', () => {
      const state = insightsReducer(initialState, closeTopDialog());
      expect(state.dialogStack).toEqual([]);
    });
  });

  describe('closeAllDialogs', () => {
    it('clears all dialogs', () => {
      const stateWithDialogs = {
        ...initialState,
        dialogStack: [dialog1, dialog2],
      };
      const state = insightsReducer(stateWithDialogs, closeAllDialogs());
      expect(state.dialogStack).toEqual([]);
    });

    it('on empty stack', () => {
      const state = insightsReducer(initialState, closeAllDialogs());
      expect(state.dialogStack).toEqual([]);
    });
  });

  describe('setSelectedSites', () => {
    it('replaces all sites', () => {
      const stateWithSites = {
        ...initialState,
        selectedSites: [site1],
      };
      const state = insightsReducer(stateWithSites, setSelectedSites([site2]));
      expect(state.selectedSites).toEqual([site2]);
    });

    it('with empty array', () => {
      const stateWithSites = {
        ...initialState,
        selectedSites: [site1, site2],
      };
      const state = insightsReducer(stateWithSites, setSelectedSites([]));
      expect(state.selectedSites).toEqual([]);
    });
  });

  describe('addSelectedSite', () => {
    it('adds new site', () => {
      const state = insightsReducer(initialState, addSelectedSite(site1));
      expect(state.selectedSites).toEqual([site1]);
    });

    it('ignores duplicate _id', () => {
      const stateWithSite = {
        ...initialState,
        selectedSites: [site1],
      };
      const state = insightsReducer(stateWithSite, addSelectedSite(site1));
      expect(state.selectedSites).toEqual([site1]);
      expect(state.selectedSites).toHaveLength(1);
    });

    it('with minimal object', () => {
      const minimalSite: SelectedSite = { _id: 's99', name: 'Minimal' };
      const state = insightsReducer(initialState, addSelectedSite(minimalSite));
      expect(state.selectedSites).toEqual([minimalSite]);
    });
  });

  describe('removeSelectedSite', () => {
    it('removes by id', () => {
      const stateWithSites = {
        ...initialState,
        selectedSites: [site1, site2],
      };
      const state = insightsReducer(stateWithSites, removeSelectedSite('s1'));
      expect(state.selectedSites).toEqual([site2]);
    });

    it('no-op on nonexistent id', () => {
      const stateWithSites = {
        ...initialState,
        selectedSites: [site1, site2],
      };
      const state = insightsReducer(
        stateWithSites,
        removeSelectedSite('nonexistent')
      );
      expect(state.selectedSites).toEqual([site1, site2]);
    });
  });

  describe('toggleSelectedSite', () => {
    it('adds if not exists', () => {
      const state = insightsReducer(initialState, toggleSelectedSite(site1));
      expect(state.selectedSites).toEqual([site1]);
    });

    it('removes if exists', () => {
      const stateWithSite = {
        ...initialState,
        selectedSites: [site1],
      };
      const state = insightsReducer(stateWithSite, toggleSelectedSite(site1));
      expect(state.selectedSites).toEqual([]);
    });

    it('uses _id for matching', () => {
      const stateWithSite = {
        ...initialState,
        selectedSites: [site1],
      };
      const updatedSite: SelectedSite = { _id: 's1', name: 'Updated Name' };
      const state = insightsReducer(
        stateWithSite,
        toggleSelectedSite(updatedSite)
      );
      expect(state.selectedSites).toEqual([]);
    });
  });

  describe('clearSelectedSites', () => {
    it('clears all sites', () => {
      const stateWithSites = {
        ...initialState,
        selectedSites: [site1, site2],
      };
      const state = insightsReducer(stateWithSites, clearSelectedSites());
      expect(state.selectedSites).toEqual([]);
    });
  });

  describe('setLoading', () => {
    it('sets isLoading true', () => {
      const state = insightsReducer(initialState, setLoading(true));
      expect(state.isLoading).toBe(true);
    });

    it('sets isLoading false', () => {
      const stateWithLoading = { ...initialState, isLoading: true };
      const state = insightsReducer(stateWithLoading, setLoading(false));
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('sets error and isLoading false', () => {
      const state = insightsReducer(
        { ...initialState, isLoading: true },
        setError('something failed')
      );
      expect(state.error).toBe('something failed');
      expect(state.isLoading).toBe(false);
    });

    it('null clears error', () => {
      const stateWithError = { ...initialState, error: 'old error' };
      const state = insightsReducer(stateWithError, setError(null));
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('openMoreInsights', () => {
    it('sets sites and pushes dialog', () => {
      const state = insightsReducer(
        initialState,
        openMoreInsights({ sites: [site1, site2] })
      );
      expect(state.selectedSites).toEqual([site1, site2]);
      expect(state.dialogStack).toEqual([
        { id: 'more-insights', type: 'more-insights' },
      ]);
    });
  });

  describe('openAddLocation', () => {
    it('pushes dialog', () => {
      const state = insightsReducer(initialState, openAddLocation());
      expect(state.dialogStack).toEqual([
        { id: 'add-location', type: 'add-location' },
      ]);
    });

    it('can create duplicates', () => {
      const state1 = insightsReducer(initialState, openAddLocation());
      const state2 = insightsReducer(state1, openAddLocation());
      expect(state2.dialogStack).toEqual([
        { id: 'add-location', type: 'add-location' },
        { id: 'add-location', type: 'add-location' },
      ]);
    });
  });
});
