import {
  getStoredTheme,
  saveThemeToStorage,
  clearStoredTheme,
  applyThemeImmediately,
  initializeTheme,
  injectThemeScript,
  getThemeScript,
} from '../themeUtils';
import type { ThemeData } from '../themeUtils';

const mockTheme: ThemeData = {
  mode: 'dark',
  primaryColor: '#ff0000',
  interfaceStyle: 'bordered',
  contentLayout: 'compact',
};

describe('themeUtils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getStoredTheme', () => {
    it('returns null when window is undefined', () => {
      const originalWindow = globalThis.window;
      try {
        // @ts-expect-error testing SSR
        delete globalThis.window;
        expect(getStoredTheme()).toBeNull();
      } finally {
        globalThis.window = originalWindow;
      }
    });

    it('returns null when localStorage is empty', () => {
      localStorage.clear();
      expect(getStoredTheme()).toBeNull();
    });

    it('returns parsed theme from localStorage', () => {
      localStorage.setItem('theme', JSON.stringify(mockTheme));
      const result = getStoredTheme();
      expect(result).toEqual(mockTheme);
    });

    it('falls back to defaults for missing fields', () => {
      localStorage.setItem('theme', JSON.stringify({ mode: 'dark' }));
      const result = getStoredTheme();
      expect(result).toEqual({
        mode: 'dark',
        primaryColor: '#1649e5',
        interfaceStyle: 'default',
        contentLayout: 'wide',
      });
    });

    it('returns group-specific theme when groupId is provided', () => {
      const groupTheme: ThemeData = {
        mode: 'light',
        primaryColor: '#00ff00',
        interfaceStyle: 'default',
        contentLayout: 'wide',
      };
      localStorage.setItem('theme_group_group1', JSON.stringify(groupTheme));
      const result = getStoredTheme('group1');
      expect(result).toEqual(groupTheme);
    });

    it('falls back to general theme when group theme is not found', () => {
      localStorage.removeItem('theme_group_missing');
      localStorage.setItem('theme', JSON.stringify(mockTheme));
      const result = getStoredTheme('missing');
      expect(result).toEqual(mockTheme);
    });
  });

  describe('saveThemeToStorage', () => {
    it('saves theme to localStorage', () => {
      saveThemeToStorage(mockTheme);
      const stored = localStorage.getItem('theme');
      expect(stored).toBe(JSON.stringify(mockTheme));
    });

    it('saves with groupId prefix', () => {
      saveThemeToStorage(mockTheme, 'group1');
      const stored = localStorage.getItem('theme_group_group1');
      expect(stored).toBe(JSON.stringify(mockTheme));
      expect(localStorage.getItem('theme')).toBeNull();
    });
  });

  describe('clearStoredTheme', () => {
    it('removes theme from localStorage', () => {
      localStorage.setItem('theme', JSON.stringify(mockTheme));
      clearStoredTheme();
      expect(localStorage.getItem('theme')).toBeNull();
    });

    it('removes group-themed from localStorage', () => {
      localStorage.setItem('theme_group_group1', JSON.stringify(mockTheme));
      clearStoredTheme('group1');
      expect(localStorage.getItem('theme_group_group1')).toBeNull();
    });

    it('does not remove general theme when clearing group', () => {
      localStorage.setItem('theme', JSON.stringify(mockTheme));
      localStorage.setItem('theme_group_group1', JSON.stringify(mockTheme));
      clearStoredTheme('group1');
      expect(localStorage.getItem('theme')).not.toBeNull();
    });
  });

  describe('saveThemeToStorage error handling', () => {
    it('swallows localStorage write errors', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('storage full');
      });
      expect(() => saveThemeToStorage(mockTheme)).not.toThrow();
    });
  });

  describe('clearStoredTheme error handling', () => {
    it('swallows localStorage remove errors', () => {
      jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('storage unavailable');
      });
      expect(() => clearStoredTheme()).not.toThrow();
    });
  });

  describe('applyThemeImmediately', () => {
    beforeEach(() => {
      document.documentElement.classList.remove('dark');
      [
        '--primary',
        '--ring',
        '--primary-50',
        '--primary-100',
        '--primary-700',
        '--primary-800',
        '--primary-900',
      ].forEach(prop => {
        document.documentElement.style.removeProperty(prop);
      });
    });

    it('sets CSS variables from a valid hex color', () => {
      applyThemeImmediately({
        mode: 'light',
        primaryColor: '#1649e5',
        interfaceStyle: 'default',
        contentLayout: 'wide',
      });
      expect(document.documentElement.style.getPropertyValue('--primary')).toBe(
        '22 73 229'
      );
      expect(document.documentElement.style.getPropertyValue('--ring')).toBe(
        '22 73 229'
      );
    });

    it('falls back to default color for invalid hex', () => {
      applyThemeImmediately({
        mode: 'light',
        primaryColor: 'not-a-hex',
        interfaceStyle: 'default',
        contentLayout: 'wide',
      });
      expect(document.documentElement.style.getPropertyValue('--primary')).toBe(
        '22 73 229'
      );
    });

    it('applies dark mode', () => {
      applyThemeImmediately({
        mode: 'dark',
        primaryColor: '#1649e5',
        interfaceStyle: 'default',
        contentLayout: 'wide',
      });
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('applies light mode', () => {
      document.documentElement.classList.add('dark');
      applyThemeImmediately({
        mode: 'light',
        primaryColor: '#1649e5',
        interfaceStyle: 'default',
        contentLayout: 'wide',
      });
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('applies system mode when prefers dark', () => {
      window.matchMedia = jest.fn().mockReturnValue({ matches: true });
      applyThemeImmediately({
        mode: 'system',
        primaryColor: '#1649e5',
        interfaceStyle: 'default',
        contentLayout: 'wide',
      });
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('applies system mode when prefers light', () => {
      window.matchMedia = jest.fn().mockReturnValue({ matches: false });
      document.documentElement.classList.add('dark');
      applyThemeImmediately({
        mode: 'system',
        primaryColor: '#1649e5',
        interfaceStyle: 'default',
        contentLayout: 'wide',
      });
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('is SSR-safe', () => {
      const originalDocument = globalThis.document;
      // @ts-expect-error testing SSR
      delete globalThis.document;
      expect(() =>
        applyThemeImmediately({
          mode: 'light',
          primaryColor: '#1649e5',
          interfaceStyle: 'default',
          contentLayout: 'wide',
        })
      ).not.toThrow();
      globalThis.document = originalDocument;
    });
  });

  describe('initializeTheme', () => {
    beforeEach(() => {
      localStorage.clear();
      const existing = document.getElementById('theme-script');
      if (existing) {
        existing.remove();
      }
      document.documentElement.classList.remove('dark');
      document.documentElement.style.removeProperty('--primary');
    });

    it('removes an existing theme script', () => {
      const script = document.createElement('script');
      script.id = 'theme-script';
      document.head.appendChild(script);
      initializeTheme();
      expect(document.getElementById('theme-script')).toBeNull();
    });

    it('applies stored theme when one exists', () => {
      localStorage.setItem('theme', JSON.stringify(mockTheme));
      initializeTheme();
      expect(document.documentElement.style.getPropertyValue('--primary')).toBe(
        '255 0 0'
      );
    });

    it('applies group-specific stored theme', () => {
      const groupTheme: ThemeData = {
        mode: 'light',
        primaryColor: '#00ff00',
        interfaceStyle: 'default',
        contentLayout: 'wide',
      };
      localStorage.setItem('theme_group_group1', JSON.stringify(groupTheme));
      initializeTheme('group1');
      expect(document.documentElement.style.getPropertyValue('--primary')).toBe(
        '0 255 0'
      );
    });

    it('is SSR-safe', () => {
      const originalDocument = globalThis.document;
      // @ts-expect-error testing SSR
      delete globalThis.document;
      expect(() => initializeTheme()).not.toThrow();
      globalThis.document = originalDocument;
    });
  });

  describe('injectThemeScript', () => {
    beforeEach(() => {
      const existing = document.getElementById('theme-script');
      if (existing) {
        existing.remove();
      }
    });

    it('injects a script tag with theme logic', () => {
      injectThemeScript();
      const script = document.getElementById('theme-script');
      expect(script).not.toBeNull();
      expect(script?.textContent).toContain('--primary');
    });

    it('does not inject duplicate scripts', () => {
      injectThemeScript();
      injectThemeScript();
      expect(document.querySelectorAll('#theme-script')).toHaveLength(1);
    });

    it('is SSR-safe', () => {
      const originalDocument = globalThis.document;
      // @ts-expect-error testing SSR
      delete globalThis.document;
      expect(() => injectThemeScript()).not.toThrow();
      globalThis.document = originalDocument;
    });
  });

  describe('getThemeScript', () => {
    it('returns a non-empty script string', () => {
      const script = getThemeScript();
      expect(typeof script).toBe('string');
      expect(script.length).toBeGreaterThan(0);
      expect(script).toContain('theme_group_');
    });
  });
});
