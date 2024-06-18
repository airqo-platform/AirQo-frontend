"use client";
import React, { useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { useTheme } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { theme } = useTheme();

  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return [children];

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
