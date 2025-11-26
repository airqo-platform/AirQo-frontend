import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import { getDefaultStyleUrl } from '../utils/mapConfig';

/**
 * Hook for managing map styles and theme
 */
export const useMapStyles = (mapStyles) => {
  const [styleUrl, setStyleUrl] = useState('');
  const { theme, systemTheme } = useTheme();

  const isDarkMode = useMemo(
    () => theme === 'dark' || (theme === 'system' && systemTheme === 'dark'),
    [theme, systemTheme],
  );

  const defaultStyleUrl = useMemo(
    () => getDefaultStyleUrl(mapStyles, isDarkMode),
    [mapStyles, isDarkMode],
  );

  // Initialize styleUrl once
  useEffect(() => {
    if (!styleUrl && defaultStyleUrl) {
      setStyleUrl(defaultStyleUrl);
    }
  }, [defaultStyleUrl, styleUrl]);

  return {
    styleUrl,
    setStyleUrl,
    isDarkMode,
    defaultStyleUrl,
  };
};
