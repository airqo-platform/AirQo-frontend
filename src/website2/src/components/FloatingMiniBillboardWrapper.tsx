'use client';

import { useEffect, useState } from 'react';

import { externalService, gridsService } from '@/services/apiService';
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
 * Client-side wrapper that fetches billboard data for all countries with pagination
 * Prioritizes Uganda first, then rotates through all other countries
 * Handles errors gracefully and provides fallback UI
 * Note: Uses client-side API calls with token proxying to avoid server costs
 */
export default function FloatingMiniBillboardWrapper() {
  const [billboardData, setBillboardData] = useState<BillboardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const fetchAllCountriesData = async () => {
      try {
        // Step 1: Fetch all countries with pagination
        const allGrids: Grid[] = [];
        let currentPage = 1;
        let hasMorePages = true;
        const limitPerPage = 50; // Fetch 50 countries per page

        // Fetch all pages
        while (hasMorePages && currentPage <= 5) {
          // Limit to 5 pages max for safety
          try {
            const pageData = await externalService.getGridsSummary({
              admin_level: 'country',
              limit: limitPerPage,
              page: currentPage,
            });

            if (pageData?.grids && pageData.grids.length > 0) {
              allGrids.push(...pageData.grids);

              // Check if there are more pages
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
            console.warn(
              `[FloatingBillboard] Failed to fetch page ${currentPage}:`,
              error instanceof Error ? error.message : 'Unknown error',
            );
            hasMorePages = false;
          }
        }

        if (!mounted || allGrids.length === 0) {
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        console.log(`[FloatingBillboard] Fetched ${allGrids.length} countries`);

        // Step 2: Sort grids to prioritize Uganda first
        const sortedGrids = [...allGrids].sort((a, b) => {
          const aIsUganda = a.name.toLowerCase().includes('uganda');
          const bIsUganda = b.name.toLowerCase().includes('uganda');

          if (aIsUganda && !bIsUganda) return -1;
          if (!aIsUganda && bIsUganda) return 1;
          return 0; // Keep original order for others
        });

        // Step 3: Fetch readings for all grids in batches
        const batchSize = 10;
        const allReadings: BillboardData[] = [];

        for (let i = 0; i < sortedGrids.length; i += batchSize) {
          const batch = sortedGrids.slice(i, i + batchSize);

          const batchPromises = batch.map(async (grid) => {
            try {
              const reading = await gridsService.getGridRepresentativeReading(
                grid._id,
                { timeout: 8000 }, // 8 second timeout per reading
              );
              return {
                grid,
                reading: reading?.data || null,
              } as BillboardData;
            } catch (error) {
              console.warn(
                `[FloatingBillboard] Failed to fetch reading for grid ${grid._id} (${grid.name}):`,
                error instanceof Error ? error.message : 'Unknown error',
              );
              return {
                grid,
                reading: null,
              } as BillboardData;
            }
          });

          const batchResults = await Promise.all(batchPromises);
          allReadings.push(...batchResults);

          // Small delay between batches to avoid rate limiting
          if (i + batchSize < sortedGrids.length) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        // Filter to only include grids with valid PM2.5 data
        const validData = allReadings.filter(
          (item) =>
            item.reading?.pm2_5?.value != null && item.reading.pm2_5.value >= 0,
        );

        console.log(
          `[FloatingBillboard] ${validData.length} countries with valid PM2.5 data`,
        );

        if (mounted && validData.length > 0) {
          setBillboardData(validData);
          setLoading(false);
        } else if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error(
          '[FloatingBillboard] Failed to fetch billboard data:',
          error instanceof Error ? error.message : 'Unknown error',
        );
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchAllCountriesData();

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // Don't render anything while loading or if there's no data
  if (loading || billboardData.length === 0) {
    return null;
  }

  return <FloatingMiniBillboard initialData={billboardData} />;
}
