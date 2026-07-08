/**
 * Theme utilities for immediate theme application and persistence
 */

export interface ThemeData {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  interfaceStyle: 'default' | 'bordered';
  contentLayout: 'compact' | 'wide';
}

const THEME_STORAGE_KEY = 'theme';
const GROUP_THEME_STORAGE_PREFIX = 'theme_group_';
const THEME_SCRIPT_ID = 'theme-script';

/**
 * Get group-specific storage key for theme
 */
function getGroupThemeKey(groupId: string): string {
  return `${GROUP_THEME_STORAGE_PREFIX}${groupId}`;
}

/**
 * Get theme from localStorage synchronously (group-specific)
 */
export function getStoredTheme(groupId?: string): ThemeData | null {
  if (typeof window === 'undefined') return null;

  try {
    // Use group-specific key if provided, otherwise fallback to general key
    const storageKey = groupId ? getGroupThemeKey(groupId) : THEME_STORAGE_KEY;
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      // If no group-specific theme, try fallback to general theme
      if (groupId) {
        const fallbackStored = localStorage.getItem(THEME_STORAGE_KEY);
        if (fallbackStored) {
          const theme = JSON.parse(fallbackStored) as Partial<ThemeData>;
          return {
            mode: theme.mode || 'light',
            primaryColor: theme.primaryColor || '#1649e5',
            interfaceStyle: theme.interfaceStyle || 'default',
            contentLayout: theme.contentLayout || 'wide',
          };
        }
      }
      return null;
    }

    const theme = JSON.parse(stored) as Partial<ThemeData>;

    // Validate and provide defaults
    return {
      mode: theme.mode || 'light',
      primaryColor: theme.primaryColor || '#1649e5',
      interfaceStyle: theme.interfaceStyle || 'default',
      contentLayout: theme.contentLayout || 'wide',
    };
  } catch (error) {
    console.error('Failed to parse stored theme:', error);
    return null;
  }
}

/**
 * Save theme to localStorage (group-specific)
 */
export function saveThemeToStorage(theme: ThemeData, groupId?: string): void {
  if (typeof window === 'undefined') return;

  try {
    const themeJson = JSON.stringify(theme);

    if (groupId) {
      // Save group-specific theme
      localStorage.setItem(getGroupThemeKey(groupId), themeJson);
    } else {
      // Save general theme as fallback
      localStorage.setItem(THEME_STORAGE_KEY, themeJson);
    }
  } catch (error) {
    console.error('Failed to save theme to storage:', error);
  }
}

/**
 * Clear theme from localStorage for a specific group
 */
export function clearStoredTheme(groupId?: string): void {
  if (typeof window === 'undefined') return;

  try {
    if (groupId) {
      localStorage.removeItem(getGroupThemeKey(groupId));
    } else {
      localStorage.removeItem(THEME_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Failed to clear stored theme:', error);
  }
}

/**
 * Convert hex color to RGB triplet string
 */
function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
    return '22 73 229';
  }
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/**
 * Lighten an RGB triplet by a given amount (0-1)
 */
function lightenRgb(rgb: string, amount: number): string {
  return rgb
    .split(' ')
    .map(c => Math.round(Number(c) + (255 - Number(c)) * amount))
    .join(' ');
}

/**
 * Darken an RGB triplet by a given amount (0-1)
 */
function darkenRgb(rgb: string, amount: number): string {
  return rgb
    .split(' ')
    .map(c => Math.round(Number(c) * (1 - amount)))
    .join(' ');
}

/**
 * Apply theme to DOM immediately — sets --primary, --ring, derived color
 * shades, and the dark mode class.
 */
export function applyThemeImmediately(theme: ThemeData): void {
  if (typeof document === 'undefined') return;

  const { mode, primaryColor } = theme;

  // Convert primary color to RGB and set core variables
  const rgb = hexToRgb(primaryColor);
  document.documentElement.style.setProperty('--primary', rgb);
  document.documentElement.style.setProperty('--ring', rgb);

  // Derive lighter / darker shades from the primary color
  document.documentElement.style.setProperty(
    '--primary-50',
    lightenRgb(rgb, 0.92)
  );
  document.documentElement.style.setProperty(
    '--primary-100',
    lightenRgb(rgb, 0.82)
  );
  document.documentElement.style.setProperty(
    '--primary-700',
    darkenRgb(rgb, 0.25)
  );
  document.documentElement.style.setProperty(
    '--primary-800',
    darkenRgb(rgb, 0.38)
  );
  document.documentElement.style.setProperty(
    '--primary-900',
    darkenRgb(rgb, 0.5)
  );

  // Apply theme mode
  if (mode === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (mode === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    // system
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}

/**
 * Initialize theme on page load (runs before React hydration)
 */
export function initializeTheme(groupId?: string): void {
  if (typeof document === 'undefined') return;

  // Remove any existing theme script to avoid duplicates
  const existingScript = document.getElementById(THEME_SCRIPT_ID);
  if (existingScript) {
    existingScript.remove();
  }

  // Get stored theme (group-specific if groupId provided)
  const theme = getStoredTheme(groupId);
  if (theme) {
    applyThemeImmediately(theme);
  }
}

/**
 * Create and inject theme script for immediate execution
 */
export function injectThemeScript(): void {
  if (typeof document === 'undefined') return;

  // Check if script already exists
  if (document.getElementById(THEME_SCRIPT_ID)) return;

  const script = document.createElement('script');
  script.id = THEME_SCRIPT_ID;
  script.textContent = getThemeScript();

  // Insert at the beginning of head to run immediately
  const head = document.head || document.getElementsByTagName('head')[0];
  if (head.firstChild) {
    head.insertBefore(script, head.firstChild);
  } else {
    head.appendChild(script);
  }
}

/**
 * Get the theme script content as a string for server-side injection.
 * Reads the active group from persisted Redux state and applies the
 * correct group-scoped theme before React hydration.
 */
export function getThemeScript(): string {
  return `
    (function() {
      try {
        var themeData = null;

        // Try to find the active group from persisted Redux state
        try {
          var userRaw = localStorage.getItem('persist:user');
          if (userRaw) {
            var userPersist = JSON.parse(userRaw);
            if (userPersist.activeGroup) {
              var activeGroup = JSON.parse(userPersist.activeGroup);
              if (activeGroup && activeGroup.id) {
                var groupKey = 'theme_group_' + activeGroup.id;
                var groupTheme = localStorage.getItem(groupKey);
                if (groupTheme) {
                  themeData = JSON.parse(groupTheme);
                }
              }
            }
          }
        } catch (e) { console.debug('Failed to parse stored theme:', e); }

        // Fallback to general theme key
        if (!themeData) {
          var generalTheme = localStorage.getItem('theme');
          if (generalTheme) {
            themeData = JSON.parse(generalTheme);
          }
        }

        if (themeData) {
          var mode = themeData.mode || 'light';
          var primaryColor = themeData.primaryColor || '#1649e5';

          // Apply primary color as RGB
          var hex = primaryColor.replace('#', '');
          if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
            hex = '1649e5';
          }
          var r = parseInt(hex.substring(0, 2), 16);
          var g = parseInt(hex.substring(2, 4), 16);
          var b = parseInt(hex.substring(4, 6), 16);
          var rgb = r + ' ' + g + ' ' + b;
          document.documentElement.style.setProperty('--primary', rgb);
          document.documentElement.style.setProperty('--ring', rgb);

          // Derive lighter shades from primary color
          function lighten(rgbStr, amount) {
            var parts = rgbStr.split(' ').map(Number);
            return parts.map(function(c) {
              return Math.round(c + (255 - c) * amount);
            }).join(' ');
          }

          // Derive darker shades from primary color
          function darken(rgbStr, amount) {
            var parts = rgbStr.split(' ').map(Number);
            return parts.map(function(c) {
              return Math.round(c * (1 - amount));
            }).join(' ');
          }

          document.documentElement.style.setProperty('--primary-50', lighten(rgb, 0.92));
          document.documentElement.style.setProperty('--primary-100', lighten(rgb, 0.82));
          document.documentElement.style.setProperty('--primary-700', darken(rgb, 0.25));
          document.documentElement.style.setProperty('--primary-800', darken(rgb, 0.38));
          document.documentElement.style.setProperty('--primary-900', darken(rgb, 0.50));

          // Apply theme mode
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
        console.error('Theme initialization failed:', e);
      }
    })();
  `;
}
