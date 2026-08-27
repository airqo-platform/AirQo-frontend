/**
 * Theme utilities for immediate theme application and persistence.
 * Mirrors the exact theme schema, tokens, and storage keys used in Nexus.
 */

export interface ThemeData {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  interfaceStyle?: 'default' | 'bordered';
  contentLayout?: 'compact' | 'wide';
}

const THEME_STORAGE_KEY = 'theme';
const GROUP_THEME_STORAGE_PREFIX = 'theme_group_';
const THEME_SCRIPT_ID = 'theme-script';

/**
 * Get group-specific storage key for theme
 */
export function getGroupThemeKey(groupId: string): string {
  return `${GROUP_THEME_STORAGE_PREFIX}${groupId}`;
}

/**
 * Safely parse a raw string from localStorage into ThemeData
 */
export function parseThemeValue(raw: string | null): ThemeData | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Handle plain string format: "light" | "dark" | "system"
  if (trimmed === 'light' || trimmed === 'dark' || trimmed === 'system') {
    return {
      mode: trimmed,
      primaryColor: '#145FFF',
      interfaceStyle: 'default',
      contentLayout: 'wide',
    };
  }

  // Handle JSON object or JSON string format
  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === 'string') {
      if (parsed === 'light' || parsed === 'dark' || parsed === 'system') {
        return {
          mode: parsed,
          primaryColor: '#145FFF',
          interfaceStyle: 'default',
          contentLayout: 'wide',
        };
      }
    } else if (typeof parsed === 'object' && parsed !== null) {
      return {
        mode: parsed.mode || 'light',
        primaryColor: parsed.primaryColor || parsed.color || '#145FFF',
        interfaceStyle: parsed.interfaceStyle || 'default',
        contentLayout: parsed.contentLayout || 'wide',
      };
    }
  } catch {
    // If not JSON, return null quietly
  }

  return null;
}

/**
 * Get theme from localStorage synchronously (group-specific with fallback)
 */
export function getStoredTheme(groupId?: string): ThemeData | null {
  if (typeof window === 'undefined') return null;

  try {
    const storageKey = groupId ? getGroupThemeKey(groupId) : THEME_STORAGE_KEY;
    const stored = localStorage.getItem(storageKey);
    const parsed = parseThemeValue(stored);
    if (parsed) return parsed;

    if (groupId) {
      const fallbackStored = localStorage.getItem(THEME_STORAGE_KEY);
      const fallbackParsed = parseThemeValue(fallbackStored);
      if (fallbackParsed) return fallbackParsed;
    }

    return null;
  } catch (error) {
    console.debug('Failed to retrieve stored theme:', error);
    return null;
  }
}

/**
 * Save theme to localStorage (group-specific and general fallback)
 */
export function saveThemeToStorage(theme: ThemeData, groupId?: string): void {
  if (typeof window === 'undefined') return;

  try {
    const themeJson = JSON.stringify(theme);
    if (groupId) {
      localStorage.setItem(getGroupThemeKey(groupId), themeJson);
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, themeJson);
    }
  } catch (error) {
    console.error('Failed to save theme to storage:', error);
  }
}

/**
 * Convert hex color to RGB triplet string ('20 95 255')
 */
export function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
    return '20 95 255';
  }
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/**
 * Lighten an RGB triplet by a given amount (0-1)
 */
export function lightenRgb(rgb: string, amount: number): string {
  return rgb
    .split(' ')
    .map((c) => Math.round(Number(c) + (255 - Number(c)) * amount))
    .join(' ');
}

/**
 * Darken an RGB triplet by a given amount (0-1)
 */
export function darkenRgb(rgb: string, amount: number): string {
  return rgb
    .split(' ')
    .map((c) => Math.round(Number(c) * (1 - amount)))
    .join(' ');
}

/**
 * Apply theme to DOM immediately — sets --primary, --ring, derived color
 * shades, and the dark mode class on document.documentElement.
 */
export function applyThemeImmediately(theme: ThemeData): void {
  if (typeof document === 'undefined') return;

  const { mode, primaryColor } = theme;
  const rgb = hexToRgb(primaryColor);

  document.documentElement.style.setProperty('--primary', rgb);
  document.documentElement.style.setProperty('--ring', rgb);

  // Derive lighter and darker shades matching Nexus
  document.documentElement.style.setProperty('--primary-50', lightenRgb(rgb, 0.92));
  document.documentElement.style.setProperty('--primary-100', lightenRgb(rgb, 0.82));
  document.documentElement.style.setProperty('--primary-700', darkenRgb(rgb, 0.25));
  document.documentElement.style.setProperty('--primary-800', darkenRgb(rgb, 0.38));
  document.documentElement.style.setProperty('--primary-900', darkenRgb(rgb, 0.5));

  // Apply theme mode
  if (mode === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (mode === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    // system
    const prefersDark =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}

/**
 * Initialize theme on page load (runs on mount or client init)
 */
export function initializeTheme(groupId?: string): void {
  if (typeof document === 'undefined') return;

  const theme = getStoredTheme(groupId);
  if (theme) {
    applyThemeImmediately(theme);
  }
}

/**
 * Get the theme script content as a string for head injection before React hydration.
 * Ensures zero-flicker on initial page load when opened from Nexus or refreshed.
 */
export function getThemeScript(): string {
  return `
    (function() {
      try {
        var themeData = null;

        function parseRaw(val) {
          if (!val) return null;
          var trimmed = val.trim();
          if (trimmed === 'light' || trimmed === 'dark' || trimmed === 'system') {
            return { mode: trimmed, primaryColor: '#145FFF' };
          }
          try {
            var obj = JSON.parse(trimmed);
            if (typeof obj === 'string') {
              return { mode: obj, primaryColor: '#145FFF' };
            }
            return obj;
          } catch(e) { return null; }
        }

        // 1. Try to find the active group theme from localStorage
        try {
          var activeGroupStr = localStorage.getItem('activeGroup') || localStorage.getItem('selectedGroup');
          if (activeGroupStr) {
            var groupKey = 'theme_group_' + activeGroupStr;
            var groupTheme = localStorage.getItem(groupKey);
            if (groupTheme) {
              themeData = parseRaw(groupTheme);
            }
          }
        } catch (e) {}

        // 2. Fallback to general theme key
        if (!themeData) {
          var generalTheme = localStorage.getItem('theme');
          if (generalTheme) {
            themeData = parseRaw(generalTheme);
          }
        }

        if (themeData) {
          var mode = themeData.mode || 'light';
          var primaryColor = themeData.primaryColor || '#145FFF';

          var hex = primaryColor.replace('#', '');
          if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
            hex = '145FFF';
          }
          var r = parseInt(hex.substring(0, 2), 16);
          var g = parseInt(hex.substring(2, 4), 16);
          var b = parseInt(hex.substring(4, 6), 16);
          var rgb = r + ' ' + g + ' ' + b;

          document.documentElement.style.setProperty('--primary', rgb);
          document.documentElement.style.setProperty('--ring', rgb);

          function lighten(rgbStr, amount) {
            return rgbStr.split(' ').map(Number).map(function(c) {
              return Math.round(c + (255 - c) * amount);
            }).join(' ');
          }

          function darken(rgbStr, amount) {
            return rgbStr.split(' ').map(Number).map(function(c) {
              return Math.round(c * (1 - amount));
            }).join(' ');
          }

          document.documentElement.style.setProperty('--primary-50', lighten(rgb, 0.92));
          document.documentElement.style.setProperty('--primary-100', lighten(rgb, 0.82));
          document.documentElement.style.setProperty('--primary-700', darken(rgb, 0.25));
          document.documentElement.style.setProperty('--primary-800', darken(rgb, 0.38));
          document.documentElement.style.setProperty('--primary-900', darken(rgb, 0.50));

          if (mode === 'dark') {
            document.documentElement.classList.add('dark');
          } else if (mode === 'light') {
            document.documentElement.classList.remove('dark');
          } else {
            var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
        }
      } catch (e) {
        console.debug('Theme initialization failed:', e);
      }
    })();
  `;
}
