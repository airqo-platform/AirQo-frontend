// Theme Module Exports

// Hooks
export { useTheme } from './hooks/useTheme';
export { useThemePreferences } from './hooks/useThemePreferences';

// Services
export { themeService } from './services/themeService';

// Store
export { default as themeReducer } from './store/themeSlice';
export {
  setThemeMode,
  setPrimaryColor,
  setInterfaceStyle,
  setContentLayout,
} from './store/themeSlice';

// Providers
export { ThemeProvider } from './providers/ThemeProvider';

// Utils
export * from './utils/themeUtils';

// Components
export { default as ThemeChanger } from './components/ThemeChanger';

// Types
export type {
  ApiErrorResponse,
  ThemeData,
  GetThemeResponse,
  UpdateThemeRequest,
  UpdateThemeResponse,
} from './types/api';
