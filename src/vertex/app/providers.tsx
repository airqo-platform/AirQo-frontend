"use client";
import { useEffect, useMemo } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { persistor, store } from "@/core/redux/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { AuthProvider } from "@/core/auth/authProvider";
import dynamic from 'next/dynamic';
import { ThemeProvider } from "@/components/theme-provider";
import SessionLoadingState from "@/components/layout/loading/session-loading";
import { QueryProvider } from "@/core/providers/query-provider";
import { runClientCacheMaintenance } from "@/core/utils/clientCache";

const NetworkStatusBanner = dynamic(
  () => import('@/components/features/network-status-banner'),
  { ssr: false }
);

import { Session } from "next-auth";

export default function Providers({ children, session }: { children: React.ReactNode, session: Session | null }) {
  const cacheScope = useMemo(() => {
    const user = session?.user as { id?: string; email?: string } | undefined;
    const userId = typeof user?.id === "string" ? user.id.trim() : "";
    if (userId) return `id:${userId}`;

    const email =
      typeof user?.email === "string" ? user.email.trim().toLowerCase() : "";
    if (email) return `email:${email}`;

    return "anon";
  }, [session?.user]);

  useEffect(() => {
    runClientCacheMaintenance();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={<SessionLoadingState />} persistor={persistor}>
        <QueryProvider scopeKey={cacheScope}>
          <AuthProvider session={session}>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
            {process.env.NODE_ENV !== "production" && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
            <NetworkStatusBanner />
          </AuthProvider>
        </QueryProvider>
      </PersistGate>
    </Provider>
  );
}
