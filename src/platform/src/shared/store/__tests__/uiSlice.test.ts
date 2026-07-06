import type { Reducer } from '@reduxjs/toolkit';
import reducer, {
  toggleSidebar,
  setSidebarCollapsed,
  openDrawer,
  closeDrawer,
  toggleDrawer,
  toggleGlobalSidebar,
} from '../uiSlice';
import type { UiState } from '../uiSlice';

const uiReducer = reducer as Reducer<UiState>;

const initialState: UiState = {
  sidebarCollapsed: false,
  drawers: {},
  globalSidebarOpen: false,
};

describe('uiSlice', () => {
  it('returns the initial state', () => {
    expect(uiReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('toggleSidebar', () => {
    it('toggles from false to true', () => {
      const state = uiReducer(initialState, toggleSidebar());
      expect(state.sidebarCollapsed).toBe(true);
    });

    it('toggles from true to false', () => {
      const stateWithSidebar = { ...initialState, sidebarCollapsed: true };
      const state = uiReducer(stateWithSidebar, toggleSidebar());
      expect(state.sidebarCollapsed).toBe(false);
    });
  });

  describe('setSidebarCollapsed', () => {
    it('sets true', () => {
      const state = uiReducer(initialState, setSidebarCollapsed(true));
      expect(state.sidebarCollapsed).toBe(true);
    });

    it('sets false', () => {
      const stateWithSidebar = { ...initialState, sidebarCollapsed: true };
      const state = uiReducer(stateWithSidebar, setSidebarCollapsed(false));
      expect(state.sidebarCollapsed).toBe(false);
    });
  });

  describe('openDrawer', () => {
    it('sets drawer true', () => {
      const state = uiReducer(initialState, openDrawer('settings'));
      expect(state.drawers['settings']).toBe(true);
    });

    it('multiple different drawers', () => {
      const state1 = uiReducer(initialState, openDrawer('settings'));
      const state2 = uiReducer(state1, openDrawer('profile'));
      expect(state2.drawers['settings']).toBe(true);
      expect(state2.drawers['profile']).toBe(true);
    });

    it('same drawer twice remains true', () => {
      const state1 = uiReducer(initialState, openDrawer('settings'));
      const state2 = uiReducer(state1, openDrawer('settings'));
      expect(state2.drawers['settings']).toBe(true);
    });
  });

  describe('closeDrawer', () => {
    it('sets drawer false', () => {
      const stateWithDrawer = {
        ...initialState,
        drawers: { settings: true },
      };
      const state = uiReducer(stateWithDrawer, closeDrawer('settings'));
      expect(state.drawers['settings']).toBe(false);
    });

    it('on never-opened drawer', () => {
      const state = uiReducer(initialState, closeDrawer('nonexistent'));
      expect(state.drawers['nonexistent']).toBe(false);
    });
  });

  describe('toggleDrawer', () => {
    it('toggles drawer', () => {
      const state1 = uiReducer(initialState, toggleDrawer('settings'));
      expect(state1.drawers['settings']).toBe(true);
      const state2 = uiReducer(state1, toggleDrawer('settings'));
      expect(state2.drawers['settings']).toBe(false);
    });

    it('toggles between multiple drawers independently', () => {
      const state1 = uiReducer(initialState, toggleDrawer('settings'));
      const state2 = uiReducer(state1, toggleDrawer('profile'));
      expect(state2.drawers['settings']).toBe(true);
      expect(state2.drawers['profile']).toBe(true);
      const state3 = uiReducer(state2, toggleDrawer('settings'));
      expect(state3.drawers['settings']).toBe(false);
      expect(state3.drawers['profile']).toBe(true);
    });
  });

  describe('toggleGlobalSidebar', () => {
    it('toggles globalSidebarOpen', () => {
      const state1 = uiReducer(initialState, toggleGlobalSidebar());
      expect(state1.globalSidebarOpen).toBe(true);
      const state2 = uiReducer(state1, toggleGlobalSidebar());
      expect(state2.globalSidebarOpen).toBe(false);
    });
  });
});
