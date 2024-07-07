"use client";
import React, { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { useTheme } from "next-themes";

const SessionAndThemeProvider = ({
  children,
  ...props
}: {
  children: React.ReactNode;
} & ThemeProviderProps) => {
  const { theme } = useTheme();

  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <SessionProvider>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </SessionProvider>
  );
};

export default SessionAndThemeProvider;
