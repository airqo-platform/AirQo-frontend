'use client';

import React from 'react';
import { SWRConfig } from 'swr';

interface SwrProviderProps {
  children: React.ReactNode;
  fallback?: Record<string, any>;
}

export function SwrProvider({ children, fallback = {} }: SwrProviderProps) {
  return (
    <SWRConfig
      value={{
        fallback,
        revalidateOnFocus: false,
        revalidateIfStale: false,
        shouldRetryOnError: true,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        dedupingInterval: 2000,
      }}
    >
      {children}
    </SWRConfig>
  );
}

export default SwrProvider;
