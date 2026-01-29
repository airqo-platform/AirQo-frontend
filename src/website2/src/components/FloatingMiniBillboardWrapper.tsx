'use client';

import { useEffect, useState } from 'react';

import { useGridsSummary } from '@/hooks/useApiHooks';
import { gridsService } from '@/services/apiService';
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

/**
 * Client-side wrapper that fetches billboard data directly using hooks
 * Handles errors gracefully and provides fallback UI
 * Note: Uses client-side API calls with token proxying to avoid server costs
 */
export default function FloatingMiniBillboardWrapper() {
  const [billboardData, setBillboardData] = useState<BillboardData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch grids summary with reduced limit for performance
  const {
    data: gridsData,
    isLoading: gridsLoading,
    error: gridsError,
  } = useGridsSummary({
    admin_level: 'country',
    limit: 10,
    page: 1,
  });

  // Fetch readings when grids data is available
  useEffect(() => {
    let mounted = true;

    const fetchReadings = async () => {
      if (!gridsData?.grids || gridsData.grids.length === 0) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      try {
        // Fetch readings for all grids in parallel
        const readingsPromises = gridsData.grids.map(async (grid) => {
          try {
            const reading = await gridsService.getGridRepresentativeReading(
              grid._id,
            );
            return {
              grid,
              reading: reading?.data || null,
            } as BillboardData;
          } catch {
            // If reading fails, return grid with null reading
            return {
              grid,
              reading: null,
            } as BillboardData;
          }
        });

        const results = await Promise.all(readingsPromises);

        // Filter to only include grids with valid PM2.5 data
        const validData = results.filter(
          (item) =>
            item.reading?.pm2_5?.value != null && item.reading.pm2_5.value >= 0,
        );

        if (mounted) {
          setBillboardData(validData);
          setLoading(false);
        }
      } catch (error) {
        console.error('[FloatingBillboard] Failed to fetch readings:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (!gridsLoading && !gridsError) {
      fetchReadings();
    }

    return () => {
      mounted = false;
    };
  }, [gridsData, gridsLoading, gridsError]);

  // Don't render anything while loading or if there's an error
  if (loading || gridsLoading || gridsError || billboardData.length === 0) {
    return null;
  }

  return <FloatingMiniBillboard initialData={billboardData} />;
}
