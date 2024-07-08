"use client";
import React, { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { useTheme } from "next-themes";
import NetworkIssues from "./NetworkIssues";

const SessionAndThemeProvider = ({
  children,
  ...props
}: {
  children: React.ReactNode;
} & ThemeProviderProps) => {
  const { theme } = useTheme();
  const [isOnline, setIsOnline] = useState(
    typeof window !== "undefined" ? navigator.onLine : true
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const goOnline = () => setIsOnline(true);
      const goOffline = () => setIsOnline(false);

      window.addEventListener("online", goOnline);
      window.addEventListener("offline", goOffline);

      return () => {
        window.removeEventListener("online", goOnline);
        window.removeEventListener("offline", goOffline);
      };
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!isOnline) {
    return <NetworkIssues />;
  }

  return (
    <SessionProvider>
      <>
        <NextThemesProvider {...props}>{children}</NextThemesProvider>
      </>
    </SessionProvider>
  );
};

export default SessionAndThemeProvider;
