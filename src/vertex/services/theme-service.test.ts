import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { themeService, buildPlatformApiUrl, getPlatformApiBaseUrl } from './theme-service';
import * as themeUtils from '@/lib/theme-utils';

describe('themeService', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('buildPlatformApiUrl', () => {
    it('builds versioned platform API url with default v2', () => {
      const url = buildPlatformApiUrl('users/theme');
      expect(url).toContain('/api/v2/users/theme');
    });

    it('handles leading slash properly', () => {
      const url = buildPlatformApiUrl('/users/preferences');
      expect(url).toContain('/api/v2/users/preferences');
    });
  });

  describe('fetchUserTheme', () => {
    it('returns stored theme if no authorization headers are available', async () => {
      const storedTheme: themeUtils.ThemeData = {
        mode: 'dark',
        primaryColor: '#145FFF',
        interfaceStyle: 'default',
        contentLayout: 'wide',
      };
      themeUtils.saveThemeToStorage(storedTheme);

      const result = await themeService.fetchUserTheme();
      expect(result).toEqual(storedTheme);
    });

    it('fetches theme from API, saves to storage and applies immediately', async () => {
      const mockApiResponse = {
        success: true,
        data: {
          theme: {
            mode: 'dark',
            primaryColor: '#0088FF',
            interfaceStyle: 'bordered',
            contentLayout: 'compact',
          },
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      const result = await themeService.fetchUserTheme('group-123', 'user-456', 'mock-token');

      expect(global.fetch).toHaveBeenCalled();
      expect(result).toEqual({
        mode: 'dark',
        primaryColor: '#0088FF',
        interfaceStyle: 'bordered',
        contentLayout: 'compact',
      });

      // Verify it was stored in localStorage
      const stored = themeUtils.getStoredTheme('group-123');
      expect(stored?.primaryColor).toBe('#0088FF');
    });

    it('falls back to local storage if API call fails', async () => {
      const fallbackTheme: themeUtils.ThemeData = {
        mode: 'light',
        primaryColor: '#145FFF',
        interfaceStyle: 'default',
        contentLayout: 'wide',
      };
      themeUtils.saveThemeToStorage(fallbackTheme, 'group-123');

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      const result = await themeService.fetchUserTheme('group-123', 'user-456', 'mock-token');
      expect(result).toEqual(fallbackTheme);
    });

    it('aborts request and exits without writing to storage or DOM when signal is aborted', async () => {
      const controller = new AbortController();
      controller.abort();

      const saveSpy = vi.spyOn(themeUtils, 'saveThemeToStorage');
      const applySpy = vi.spyOn(themeUtils, 'applyThemeImmediately');

      const result = await themeService.fetchUserTheme(
        'group-123',
        'user-456',
        'mock-token',
        controller.signal
      );

      expect(result).toBeNull();
      expect(saveSpy).not.toHaveBeenCalled();
      expect(applySpy).not.toHaveBeenCalled();
    });
  });

  describe('updateUserTheme', () => {
    it('sends PUT request to update theme', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
      } as Response);

      const success = await themeService.updateUserTheme(
        { mode: 'dark' },
        'group-123',
        'mock-token'
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/preferences/theme/organization/group/group-123'),
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            Authorization: 'JWT mock-token',
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(success).toBe(true);
    });

    it('returns false if no token is available', async () => {
      const success = await themeService.updateUserTheme({ mode: 'dark' });
      expect(success).toBe(false);
    });
  });
});
