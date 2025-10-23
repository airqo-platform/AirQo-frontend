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
 * Apply theme to DOM immediately
 */
export function applyThemeImmediately(theme: ThemeData): void {
  if (typeof document === 'undefined') return;

  const { mode, primaryColor } = theme;

  // Apply primary color CSS variable
  const rgb =
    primaryColor
      .replace('#', '')
      .match(/.{2}/g)
      ?.map(c => parseInt(c, 16))
      .join(' ') || '20 95 255';
  document.documentElement.style.setProperty('--primary', rgb);

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
  script.textContent = `
    (function() {
      try {
        var theme = localStorage.getItem('theme');
        if (theme) {
          var data = JSON.parse(theme);
          var mode = data.mode || 'light';
          var primaryColor = data.primaryColor || '#1649e5';

          // Apply primary color
          var rgb = primaryColor.replace('#', '').match(/.{2}/g);
          if (rgb) {
            rgb = rgb.map(function(c) { return parseInt(c, 16); }).join(' ');
            document.documentElement.style.setProperty('--primary', rgb);
          }

          // Apply theme mode
          if (mode === 'dark') {
            document.documentElement.classList.add('dark');
          } else if (mode === 'light') {
            document.documentElement.classList.remove('dark');
          } else {
            // system preference
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

  // Insert at the beginning of head to run immediately
  const head = document.head || document.getElementsByTagName('head')[0];
  if (head.firstChild) {
    head.insertBefore(script, head.firstChild);
  } else {
    head.appendChild(script);
  }
}
