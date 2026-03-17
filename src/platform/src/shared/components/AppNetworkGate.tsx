'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import { WarningBanner, Button } from '@/shared/components/ui';

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

  return (
    <>
      {isOffline && (
        <div className="sticky top-0 z-[2000] p-2 md:p-3">
          <WarningBanner
            title="You're offline"
            message="Showing cached data. Reconnect to refresh with the latest updates."
            dense
            actions={
              <Button size="sm" variant="outlined" onClick={handleRetry}>
                Retry connection
              </Button>
            }
          />
        </div>
      )}
      {children}
    </>
  );
};

export default AppNetworkGate;
