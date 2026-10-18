'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { apiQueryKeys } from '@/queries/query-keys';
import { externalService } from '@/services/external';
import { gridsService } from '@/services/website';
import { Grid } from '@/types/grids';

import FloatingMiniBillboard from './FloatingMiniBillboard';

interface BillboardData {
  grid: Grid;
  reading: {
    pm2_5?: {
      value: number;
    };
  } | null;
}

const INITIAL_BILLBOARD_FETCH_DELAY_MS = 6000;
const MAX_BILLBOARD_GRIDS = 8;
const REPRESENTATIVE_BATCH_SIZE = 4;

const isBillboardSuppressedRoute = (pathname: string | null) =>
  pathname?.startsWith('/packages') ||
  pathname?.startsWith('/solutions/network-coverage') ||
  pathname?.startsWith('/africa-clean-air-forum-2026');

const reportFloatingBillboardIssue = (
  message: string,
  error: unknown,
  level: 'warn' | 'error' = 'warn',
) => {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const errorMessage = error instanceof Error ? error.message : 'Unknown error';

  if (level === 'error') {
    console.error(message, errorMessage);
    return;
  }

  console.warn(message, errorMessage);
};

const fetchFloatingBillboardData = async (): Promise<BillboardData[]> => {
  try {
    // Fetch all country grids with pagination, then sample a bounded number of
    // representative readings for the decorative billboard.
    const allGrids: Grid[] = [];
    let currentPage = 1;
    let hasMorePages = true;
    const limitPerPage = 50;

    while (hasMorePages && currentPage <= 5) {
      try {
        const pageData = await externalService.getGridsSummary({
          admin_level: 'country',
          limit: limitPerPage,
          page: currentPage,
        });

        if (pageData?.grids && pageData.grids.length > 0) {
          allGrids.push(...pageData.grids);

          const meta = pageData.meta;
          if (meta && currentPage < meta.totalPages) {
            currentPage++;
          } else {
            hasMorePages = false;
          }
        } else {
          hasMorePages = false;
        }
      } catch (error) {
        reportFloatingBillboardIssue(
          `[FloatingBillboard] Failed to fetch page ${currentPage}:`,
          error,
        );
        hasMorePages = false;
      }
    }

    if (allGrids.length === 0) return [];

    const sortedGrids = [...allGrids].sort((a, b) => {
      const aIsUganda = a.name.toLowerCase().includes('uganda');
      const bIsUganda = b.name.toLowerCase().includes('uganda');

      if (aIsUganda && !bIsUganda) return -1;
      if (!aIsUganda && bIsUganda) return 1;
      return 0;
    });

    const gridsToRead = sortedGrids.slice(0, MAX_BILLBOARD_GRIDS);
    const allReadings: BillboardData[] = [];

    for (let i = 0; i < gridsToRead.length; i += REPRESENTATIVE_BATCH_SIZE) {
      const batch = gridsToRead.slice(i, i + REPRESENTATIVE_BATCH_SIZE);

      const batchPromises = batch.map(async (grid) => {
        try {
          const reading = await gridsService.getGridRepresentativeReading(
            grid._id,
            { timeout: 8000 },
          );
          return {
            grid,
            reading: reading?.data || null,
          } as BillboardData;
        } catch (error) {
          reportFloatingBillboardIssue(
            `[FloatingBillboard] Failed to fetch reading for grid ${grid._id} (${grid.name}):`,
            error,
          );
          return { grid, reading: null } as BillboardData;
        }
      });

      allReadings.push(...(await Promise.all(batchPromises)));

      if (i + REPRESENTATIVE_BATCH_SIZE < gridsToRead.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    return allReadings.filter(
      (item) =>
        item.reading?.pm2_5?.value != null && item.reading.pm2_5.value >= 0,
    );
  } catch (error) {
    reportFloatingBillboardIssue(
      '[FloatingBillboard] Failed to fetch billboard data:',
      error,
      'error',
    );
    return [];
  }
};

/**
 * Client-side wrapper that fetches billboard data for all countries with pagination
 * Prioritizes Uganda first, then rotates through all other countries
 * Handles errors gracefully and provides fallback UI
 * Note: Uses client-side API calls with token proxying to avoid server costs
 */
export default function FloatingMiniBillboardWrapper() {
  const pathname = usePathname();
  const isSuppressedRoute = Boolean(isBillboardSuppressedRoute(pathname));
  const [isDelayComplete, setIsDelayComplete] = useState(false);

  useEffect(() => {
    if (isSuppressedRoute || isDelayComplete) return;

    const fetchDelayId = window.setTimeout(
      () => setIsDelayComplete(true),
      INITIAL_BILLBOARD_FETCH_DELAY_MS,
    );

    return () => {
      window.clearTimeout(fetchDelayId);
    };
  }, [isDelayComplete, isSuppressedRoute]);

  const { data: billboardData = [], isLoading } = useQuery({
    queryKey: apiQueryKeys.floatingBillboard(),
    queryFn: fetchFloatingBillboardData,
    enabled: !isSuppressedRoute && isDelayComplete,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  if (
    isSuppressedRoute ||
    isLoading ||
    billboardData.length === 0 ||
    pathname?.startsWith('/billboard')
  ) {
    return null;
  }

  return <FloatingMiniBillboard initialData={billboardData} />;
}
