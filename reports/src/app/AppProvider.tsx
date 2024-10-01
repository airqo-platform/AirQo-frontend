'use client';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { ThemeProviderProps } from 'next-themes/dist/types';
import { useRef, useEffect, useState } from 'react';
import { Provider } from 'react-redux';

import { AppStore, makeStore } from '../lib/store';

const AppProvider: React.FC<React.PropsWithChildren<ThemeProviderProps>> = ({
  children,
  ...props
}) => {
  const storeRef = useRef<AppStore | null>(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Initialize store
  useEffect(() => {
    storeRef.current = makeStore();
    setMounted(true);
  }, []);

  // Update body class based on theme
  useEffect(() => {
    if (mounted) {
      document.body.classList.toggle('dark', theme === 'dark');
    }
  }, [theme, mounted]);

  if (!mounted) return null;

  return (
    <Provider store={storeRef.current!}>
      <SessionProvider basePath="/reports/api/auth">
        <NextThemesProvider {...props}>{children}</NextThemesProvider>
      </SessionProvider>
    </Provider>
  );
};

export default AppProvider;
