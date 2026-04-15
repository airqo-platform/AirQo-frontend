'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useSWRConfig } from 'swr';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import { WarningBanner, Button } from '@/shared/components/ui';

interface AppNetworkGateProps {
  children: React.ReactNode;
}

const AppNetworkGate = ({ children }: AppNetworkGateProps) => {
  const { isOnline, isOffline } = useNetworkStatus();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutate } = useSWRConfig();
  const wasOfflineRef = useRef(false);
  const isRefreshingRef = useRef(false);

  const refreshCachedData = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;

    try {
      await queryClient.invalidateQueries();
      await queryClient.refetchQueries({ type: 'active' });
      await mutate(() => true, undefined, {
        revalidate: true,
      });
      router.refresh();
    } finally {
      isRefreshingRef.current = false;
    }
  }, [mutate, queryClient, router]);

  useEffect(() => {
    if (isOffline) {
      wasOfflineRef.current = true;
      return;
    }

    if (isOnline && wasOfflineRef.current) {
      wasOfflineRef.current = false;
      void refreshCachedData();
    }
  }, [isOnline, isOffline, refreshCachedData]);

  const handleRetry = useCallback(() => {
    void refreshCachedData();
  }, [refreshCachedData]);

  return (
    <>
      {isOffline && (
        <div className="sticky top-0 z-[2000] p-2 md:p-3">
          <WarningBanner
            title="You're offline"
            message="Showing cached data. Reconnect refreshes stale data automatically, and Retry forces a fresh sync."
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
