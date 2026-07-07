'use client';

import React, { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { WarningBanner } from '@/shared/components/ui';
import { maintenanceService } from '@/shared/services/maintenanceService';
import type { MaintenanceItem } from '@/shared/types/api';

const MAINTENANCE_PRODUCT = 'analytics';
const MAINTENANCE_REFRESH_INTERVAL_MS = 60 * 1000;

type MaintenanceStatus = 'scheduled' | 'in_progress';

type MaintenanceCandidate = {
  maintenance: MaintenanceItem;
  startMs: number;
  endMs: number;
  status: MaintenanceStatus | 'expired';
};

type ActiveMaintenanceCandidate = Omit<MaintenanceCandidate, 'status'> & {
  status: MaintenanceStatus;
};

const formatCountdown = (remainingMs: number): string => {
  const safeRemainingMs = Math.max(0, remainingMs);
  const totalSeconds = Math.floor(safeRemainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');

  return `${hh}:${mm}:${ss}`;
};

const parseTimestamp = (date?: string): number => {
  if (!date) {
    return NaN;
  }

  const timestamp = new Date(date).getTime();
  return Number.isNaN(timestamp) ? NaN : timestamp;
};

const compareNumbers = (left: number, right: number): number => {
  const normalizedLeft = Number.isNaN(left) ? Number.POSITIVE_INFINITY : left;
  const normalizedRight = Number.isNaN(right)
    ? Number.POSITIVE_INFINITY
    : right;

  return normalizedLeft - normalizedRight;
};

const getMaintenanceStatus = (
  startMs: number,
  endMs: number,
  now: number
): MaintenanceStatus | 'expired' => {
  if (Number.isNaN(endMs) || endMs <= now) {
    return 'expired';
  }

  if (!Number.isNaN(startMs) && now < startMs) {
    return 'scheduled';
  }

  return 'in_progress';
};

const isActiveMaintenanceCandidate = (
  candidate: MaintenanceCandidate
): candidate is ActiveMaintenanceCandidate => candidate.status !== 'expired';

const selectMaintenance = (
  maintenance: MaintenanceItem[] | undefined,
  now: number
): ActiveMaintenanceCandidate | null => {
  if (!maintenance?.length) {
    return null;
  }

  const candidates = maintenance
    .filter(
      item =>
        item.isActive && item.product?.toLowerCase() === MAINTENANCE_PRODUCT
    )
    .map(item => {
      const startMs = parseTimestamp(item.startDate);
      const endMs = parseTimestamp(item.endDate);

      return {
        maintenance: item,
        startMs,
        endMs,
        status: getMaintenanceStatus(startMs, endMs, now),
      };
    })
    .filter(isActiveMaintenanceCandidate);

  if (!candidates.length) {
    return null;
  }

  const inProgressCandidates = candidates
    .filter(candidate => candidate.status === 'in_progress')
    .sort(
      (left, right) =>
        compareNumbers(left.endMs, right.endMs) ||
        compareNumbers(left.startMs, right.startMs)
    );

  if (inProgressCandidates.length) {
    return inProgressCandidates[0];
  }

  const scheduledCandidates = candidates
    .filter(candidate => candidate.status === 'scheduled')
    .sort(
      (left, right) =>
        compareNumbers(left.startMs, right.startMs) ||
        compareNumbers(left.endMs, right.endMs)
    );

  return scheduledCandidates[0] ?? null;
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

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  const maintenanceView = useMemo(
    () => selectMaintenance(data?.maintenance, now),
    [data?.maintenance, now]
  );

  if (!maintenanceView) return null;

  const remainingLabel = formatCountdown(maintenanceView.endMs - now);
  const title =
    maintenanceView.status === 'scheduled'
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
                {maintenanceView.maintenance.message}
              </p>

              <p className="text-sm font-semibold tracking-wide text-foreground">
                Time remaining:{' '}
                <span className="font-mono tabular-nums" aria-live="polite">
                  {remainingLabel}
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
