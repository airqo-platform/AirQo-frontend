'use client';

import React, { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { WarningBanner } from '@/shared/components/ui';
import { maintenanceService } from '@/shared/services/maintenanceService';
import type { MaintenanceItem } from '@/shared/types/api';

const MAINTENANCE_PRODUCT = 'analytics';
const MAINTENANCE_REFRESH_INTERVAL_MS = 60 * 1000;

const formatCountdown = (remainingMs: number): string => {
  const safeRemainingMs = Math.max(0, remainingMs);
  const totalSeconds = Math.floor(safeRemainingMs / 1000);
  const totalHours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = totalHours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');

  return `${hh}:${mm}:${ss}`;
};

const getValidMaintenance = (
  maintenance: MaintenanceItem[] | undefined
): MaintenanceItem | null => {
  if (!maintenance?.length) {
    return null;
  }

  return (
    maintenance.find(
      item =>
        item.isActive && item.product?.toLowerCase() === MAINTENANCE_PRODUCT
    ) || null
  );
};

export const MaintenanceBanner: React.FC = () => {
  const { data } = useSWR(
    `maintenance:${MAINTENANCE_PRODUCT}`,
    () => maintenanceService.getMaintenance(MAINTENANCE_PRODUCT),
    {
      refreshInterval: MAINTENANCE_REFRESH_INTERVAL_MS,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
      dedupingInterval: 15 * 1000,
    }
  );

  const maintenance = useMemo(
    () => getValidMaintenance(data?.maintenance),
    [data?.maintenance]
  );
  const [now, setNow] = useState(() => Date.now());

  const endMs = maintenance?.endDate
    ? new Date(maintenance.endDate).getTime()
    : NaN;

  useEffect(() => {
    if (!maintenance) return;
    if (Number.isNaN(endMs)) return;

    const updateClock = () => setNow(Date.now());
    // Always update every second for a smooth, second-accurate countdown.
    updateClock();
    const intervalId = window.setInterval(() => {
      const currentNow = Date.now();
      setNow(currentNow);

      if (currentNow >= endMs) {
        window.clearInterval(intervalId);
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [maintenance, endMs]);

  if (!maintenance || Number.isNaN(endMs)) {
    return null;
  }

  const remainingMs = Math.max(0, endMs - now);
  if (remainingMs <= 0) {
    return null;
  }

  const countdown = formatCountdown(remainingMs);

  const title = 'Maintenance in progress';

  return (
    <div className="w-full px-4 pt-4">
      <div className="mx-auto w-full max-w-7xl">
        <WarningBanner
          title={title}
          message={
            <div className="space-y-2">
              <p className="text-sm leading-6 text-foreground/90">
                {maintenance.message}
              </p>

              <p className="text-sm font-semibold tracking-wide text-foreground">
                Ends in:{' '}
                <span className="font-mono tabular-nums text-foreground">
                  {countdown}
                </span>
              </p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default MaintenanceBanner;
