'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import NoInternetConnection from './NoInternetConnection';

interface AppNetworkGateProps {
  children: React.ReactNode;
}

const AppNetworkGate = ({ children }: AppNetworkGateProps) => {
  const { isOnline, isOffline } = useNetworkStatus();
  const router = useRouter();
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    if (isOffline) {
      wasOfflineRef.current = true;
      return;
    }

    if (isOnline && wasOfflineRef.current) {
      wasOfflineRef.current = false;
      router.refresh();
    }
  }, [isOnline, isOffline, router]);

  const handleRetry = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      router.refresh();
    }
  }, [router]);

  if (isOffline) {
    return <NoInternetConnection onRetry={handleRetry} />;
  }

  return <>{children}</>;
};

export default AppNetworkGate;
