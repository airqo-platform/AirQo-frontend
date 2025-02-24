'use client';
import { useRef, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { AppStore, makeStore } from '../lib/store';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { useTheme } from 'next-themes';
// import Loading from "./loading";

const AppProvider = ({
  children,
  ...props
}: {
  children: React.ReactNode;
} & ThemeProviderProps) => {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Provider store={storeRef.current}>
      <SessionProvider basePath="/reports/api/auth">
        <NextThemesProvider {...props}>{children}</NextThemesProvider>
      </SessionProvider>
    </Provider>
  );
};

export default AppProvider;
