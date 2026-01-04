"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { persistor, store } from "@/core/redux/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { AuthProvider } from "@/core/auth/authProvider";
import dynamic from 'next/dynamic';
import { ThemeProvider } from "@/components/theme-provider";

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
          },
        },
      })
  );

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider session={session}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
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
