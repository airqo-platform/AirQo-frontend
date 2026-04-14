"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AxiosError } from "axios";
import { persistor, store } from "@/core/redux/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { AuthProvider } from "@/core/auth/authProvider";
import dynamic from 'next/dynamic';
import { ThemeProvider } from "@/components/theme-provider";
import SessionLoadingState from "@/components/layout/loading/session-loading";

const NetworkStatusBanner = dynamic(
  () => import('@/components/features/network-status-banner'),
  { ssr: false }
);

import { Session } from "next-auth";

export default function Providers({ children, session }: { children: React.ReactNode, session: Session | null }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            networkMode: 'offlineFirst',
            retry: (failureCount, error) => {
              const axiosError = error as AxiosError;
              const status = axiosError?.response?.status;
              // Do not thrash retries while offline/server unreachable.
              if (status === 0 || axiosError?.code === 'ERR_NETWORK' || axiosError?.code === 'ECONNABORTED') {
                return false;
              }
              return failureCount < 2;
            },
            throwOnError: false,
          },
          mutations: {
            networkMode: 'offlineFirst',
            retry: 0,
          },
        },
      })
  );

  return (
    <Provider store={store}>
      <PersistGate loading={<SessionLoadingState />} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
