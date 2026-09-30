"use client";
import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { persistor, store } from "@/core/redux/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { AuthProvider, isPublicPath } from "@/core/auth/authProvider";
import dynamic from 'next/dynamic';
import { ThemeProvider } from "@/components/theme-provider";
import SessionLoadingState from "@/components/layout/loading/session-loading";
import { QueryProvider } from "@/core/providers/query-provider";
import { runClientCacheMaintenance } from "@/core/utils/clientCache";
import { BannerProvider } from "@/context/banner-context";

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

  // Public pages (login, auth-error, download) don't depend on the persisted
  // Redux state, so render them straight away. That lets the server send the
  // actual page instead of a spinner that waits for all the client JS.
  // Protected pages still wait for rehydration, as before.
  const pathname = usePathname();
  const isPublicPage = isPublicPath(pathname);

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        {(bootstrapped) =>
          bootstrapped || isPublicPage ? (
            <QueryProvider scopeKey={cacheScope}>
              <BannerProvider>
                <AuthProvider session={session}>
                  <ThemeProvider>
                    {children}
                  </ThemeProvider>
                  {process.env.NODE_ENV !== "production" && (
                    <ReactQueryDevtools initialIsOpen={false} />
                  )}
                  <NetworkStatusBanner />
                </AuthProvider>
              </BannerProvider>
            </QueryProvider>
          ) : (
            <SessionLoadingState />
          )
        }
      </PersistGate>
    </Provider>
  );
}
