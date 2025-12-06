"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { store } from "@/core/redux/store";
import { Provider } from "react-redux";
import { AuthProvider } from "@/core/auth/authProvider";
import dynamic from 'next/dynamic';

const NetworkStatusBanner = dynamic(
  () => import('@/components/features/network-status-banner'),
  { ssr: false }
);

export default function Providers({ children }: { children: React.ReactNode }) {
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
      <QueryClientProvider client={queryClient}>
        <AuthProvider> {/* AuthProvider now handles session initialization internally */}
          {children}
          {process.env.NODE_ENV !== "production" && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
          <NetworkStatusBanner />
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  );
}
