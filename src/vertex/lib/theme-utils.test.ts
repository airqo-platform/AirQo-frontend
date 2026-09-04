import { describe, it, expect, beforeEach } from 'vitest';
import {
  hexToRgb,
  lightenRgb,
  darkenRgb,
  parseThemeValue,
  getGroupThemeKey,
  getStoredTheme,
  saveThemeToStorage,
  clearStoredTheme,
  applyThemeImmediately,
  getThemeScript,
  THEME_STORAGE_KEY,
  ThemeData,
} from './theme-utils';

describe('theme-utils', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('style');
  });

  describe('hexToRgb', () => {
    it('converts 6-digit hex color with hash to RGB triplet', () => {
      expect(hexToRgb('#145FFF')).toBe('20 95 255');
    });

    it('converts 6-digit hex color without hash to RGB triplet', () => {
      expect(hexToRgb('145FFF')).toBe('20 95 255');
    });

    it('falls back to default RGB triplet for invalid hex strings', () => {
      expect(hexToRgb('invalid')).toBe('20 95 255');
      expect(hexToRgb('#123')).toBe('20 95 255');
      expect(hexToRgb('')).toBe('20 95 255');
    });
  });

  describe('lightenRgb and darkenRgb', () => {
    it('lightens an RGB triplet', () => {
      const rgb = '20 95 255';
      const lightened = lightenRgb(rgb, 0.5);
      expect(lightened).toBe('138 175 255');
    });

    it('darkens an RGB triplet', () => {
      const rgb = '20 95 255';
      const darkened = darkenRgb(rgb, 0.5);
      expect(darkened).toBe('10 48 128');
    });
  });

  describe('parseThemeValue', () => {
    it('returns null for null or empty input', () => {
      expect(parseThemeValue(null)).toBeNull();
      expect(parseThemeValue('')).toBeNull();
      expect(parseThemeValue('   ')).toBeNull();
    });

    it('parses raw mode string ("dark", "light", "system")', () => {
      expect(parseThemeValue('dark')).toEqual({
        mode: 'dark',
        primaryColor: '#145FFF',
        interfaceStyle: 'default',
        contentLayout: 'wide',
      });
      expect(parseThemeValue('light')?.mode).toBe('light');
      expect(parseThemeValue('system')?.mode).toBe('system');
    });

    it('parses JSON string encoded mode', () => {
      expect(parseThemeValue('"dark"')).toEqual({
        mode: 'dark',
        primaryColor: '#145FFF',
        interfaceStyle: 'default',
        contentLayout: 'wide',
      });
    });

    it('parses valid ThemeData JSON object', () => {
      const json = JSON.stringify({
        mode: 'dark',
        primaryColor: '#0055FF',
        interfaceStyle: 'bordered',
        contentLayout: 'compact',
      });

      expect(parseThemeValue(json)).toEqual({
        mode: 'dark',
        primaryColor: '#0055FF',
        interfaceStyle: 'bordered',
        contentLayout: 'compact',
      });
    });

    it('provides defaults when JSON fields are missing', () => {
      const json = JSON.stringify({
        primaryColor: '#FF0000',
      });

      expect(parseThemeValue(json)).toEqual({
        mode: 'light',
        primaryColor: '#FF0000',
        interfaceStyle: 'default',
        contentLayout: 'wide',
      });
    });

    it('returns null for invalid/malformed JSON string', () => {
      expect(parseThemeValue('{not-valid-json')).toBeNull();
    });
  });

  describe('getGroupThemeKey', () => {
    it('returns prefixed group key', () => {
      expect(getGroupThemeKey('group-123')).toBe('theme_group_group-123');
    });
  });

  describe('storage operations', () => {
    const mockTheme: ThemeData = {
      mode: 'dark',
      primaryColor: '#FF5500',
      interfaceStyle: 'bordered',
      contentLayout: 'compact',
    };

    it('saves and retrieves general theme', () => {
      saveThemeToStorage(mockTheme);
      expect(getStoredTheme()).toEqual(mockTheme);
    });

    it('saves and retrieves group-specific theme', () => {
      saveThemeToStorage(mockTheme, 'group-1');
      expect(getStoredTheme('group-1')).toEqual(mockTheme);
    });

    it('falls back to general theme when group theme is missing', () => {
      saveThemeToStorage(mockTheme);
      expect(getStoredTheme('non-existent-group')).toEqual(mockTheme);
    });

    it('clears stored theme', () => {
      saveThemeToStorage(mockTheme, 'group-1');
      clearStoredTheme('group-1');
      expect(localStorage.getItem(getGroupThemeKey('group-1'))).toBeNull();

      saveThemeToStorage(mockTheme);
      clearStoredTheme();
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
    });
  });

  describe('applyThemeImmediately', () => {
    it('sets primary and ring CSS variables and adds dark class in dark mode', () => {
      applyThemeImmediately({
        mode: 'dark',
        primaryColor: '#145FFF',
      });

      expect(document.documentElement.style.getPropertyValue('--primary')).toBe('20 95 255');
      expect(document.documentElement.style.getPropertyValue('--ring')).toBe('20 95 255');
      expect(document.documentElement.style.getPropertyValue('--primary-50')).toBeTruthy();
      expect(document.documentElement.style.getPropertyValue('--primary-700')).toBeTruthy();
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('removes dark class in light mode', () => {
      document.documentElement.classList.add('dark');

      applyThemeImmediately({
        mode: 'light',
        primaryColor: '#145FFF',
      });

      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('getThemeScript', () => {
    it('returns valid JavaScript script string', () => {
      const script = getThemeScript();
      expect(typeof script).toBe('string');
      expect(script).toContain('theme_group_');
      expect(script).toContain('--primary');
      expect(script).toContain('--ring');
    });
  });
});
