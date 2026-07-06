import type { Reducer } from '@reduxjs/toolkit';
import reducer, {
  setThemeMode,
  setPrimaryColor,
  setInterfaceStyle,
  setContentLayout,
} from '../themeSlice';
import type { ThemeState } from '../themeSlice';

const themeReducer = reducer as Reducer<ThemeState>;

const initialState: ThemeState = {
  mode: 'light',
  primaryColor: '#1649e5',
  interfaceStyle: 'default',
  contentLayout: 'wide',
};

describe('themeSlice', () => {
  it('returns the initial state', () => {
    expect(themeReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setThemeMode', () => {
    it('sets mode to dark', () => {
      const state = themeReducer(initialState, setThemeMode('dark'));
      expect(state.mode).toBe('dark');
    });

    it('sets mode to light', () => {
      const darkState = { ...initialState, mode: 'dark' as const };
      const state = themeReducer(darkState, setThemeMode('light'));
      expect(state.mode).toBe('light');
    });

    it('sets mode to system', () => {
      const state = themeReducer(initialState, setThemeMode('system'));
      expect(state.mode).toBe('system');
    });
  });

  describe('setPrimaryColor', () => {
    it('sets a new color', () => {
      const state = themeReducer(initialState, setPrimaryColor('#ff0000'));
      expect(state.primaryColor).toBe('#ff0000');
    });

    it('sets another color string', () => {
      const state = themeReducer(initialState, setPrimaryColor('rgb(0,128,0)'));
      expect(state.primaryColor).toBe('rgb(0,128,0)');
    });
  });

  describe('setInterfaceStyle', () => {
    it('sets style to bordered', () => {
      const state = themeReducer(initialState, setInterfaceStyle('bordered'));
      expect(state.interfaceStyle).toBe('bordered');
    });

    it('sets style back to default', () => {
      const borderedState = {
        ...initialState,
        interfaceStyle: 'bordered' as const,
      };
      const state = themeReducer(borderedState, setInterfaceStyle('default'));
      expect(state.interfaceStyle).toBe('default');
    });
  });

  describe('setContentLayout', () => {
    it('sets layout to compact', () => {
      const state = themeReducer(initialState, setContentLayout('compact'));
      expect(state.contentLayout).toBe('compact');
    });

    it('sets layout back to wide', () => {
      const compactState = {
        ...initialState,
        contentLayout: 'compact' as const,
      };
      const state = themeReducer(compactState, setContentLayout('wide'));
      expect(state.contentLayout).toBe('wide');
    });
  });
});
