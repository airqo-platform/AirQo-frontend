'use client';

import React, { useMemo, useEffect, useState } from 'react';
import useSWR from 'swr';
import { WarningBanner } from '@/shared/components/ui';
import { maintenanceService } from '@/shared/services/maintenanceService';
import type { MaintenanceItem } from '@/shared/types/api';

const MAINTENANCE_PRODUCT = 'analytics';
const MAINTENANCE_REFRESH_INTERVAL_MS = 60 * 1000;

const formatCountdown = (remainingMs: number): string => {
  const safeRemainingMs = Math.max(0, remainingMs);
  const totalSeconds = Math.floor(safeRemainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');
  // Always return a HH:MM:SS string using total hours (no days displayed).
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

  const startMs = maintenance?.startDate
    ? new Date(maintenance.startDate).getTime()
    : NaN;
  const endMs = maintenance?.endDate
    ? new Date(maintenance.endDate).getTime()
    : NaN;

  // Tick every second while we have a valid end time so the countdown updates.
  useEffect(() => {
    if (Number.isNaN(endMs)) return undefined;

    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [endMs]);

  if (!maintenance) return null;

  // Compute current status from the current time so we can hide expired
  // maintenance records. We don't need a live ticking clock because the
  // banner now displays the estimated length (end - start) rather than a
  // live remaining countdown.
  const status: 'scheduled' | 'in_progress' | 'expired' = (() => {
    if (!maintenance) return 'expired';
    if (!Number.isNaN(startMs) && now < startMs) return 'scheduled';
    if (!Number.isNaN(endMs) && now <= endMs) return 'in_progress';
    return 'expired';
  })();

  if (status === 'expired') return null;

  // Show a live countdown to the end time if available.
  const remainingLabel = !Number.isNaN(endMs)
    ? formatCountdown(Math.max(0, endMs - now))
    : null;

  const title =
    status === 'scheduled'
      ? 'Scheduled maintenance'
      : 'Maintenance in progress';

  return (
    <div className="w-full md:px-4 pt-4">
      <div className="mx-auto w-full max-w-7xl">
        <WarningBanner
          title={title}
          message={
            <div className="space-y-2">
              <p className="text-sm leading-6 text-foreground/90">
                {maintenance.message}
              </p>

              {remainingLabel ? (
                <p className="text-sm font-semibold tracking-wide text-foreground">
                  Time remaining:{' '}
                  <span className="font-mono tabular-nums" aria-live="polite">
                    {remainingLabel}
                  </span>
                </p>
              ) : null}
            </div>
          }
        />
      </div>
    </div>
  );
};

export default MaintenanceBanner;
