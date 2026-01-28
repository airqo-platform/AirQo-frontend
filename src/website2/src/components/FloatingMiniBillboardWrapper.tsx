import gridsService from '@/services/apiService/grids';
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
 * Server Component wrapper that fetches billboard data server-side
 * This prevents API calls from being exposed in the network tab
 */
export default async function FloatingMiniBillboardWrapper() {
  try {
    console.log('[FloatingBillboard] Starting server-side data fetch...');

    // Fetch grids summary server-side
    const gridsData = await gridsService.getGridsSummary({
      admin_level: 'country',
      limit: 20,
      page: 1,
    });

    if (!gridsData?.grids || gridsData.grids.length === 0) {
      console.log('[FloatingBillboard] No grids found');
      return null;
    }

    // Fetch readings for all grids in parallel
    const billboardDataPromises = gridsData.grids.map(async (grid) => {
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

    const billboardData = await Promise.all(billboardDataPromises);

    // Filter to only include grids with valid PM2.5 data
    const validData = billboardData.filter(
      (item) =>
        item.reading?.pm2_5?.value != null && item.reading.pm2_5.value >= 0,
    );

    if (validData.length === 0) {
      console.log('[FloatingBillboard] No valid PM2.5 data found');
      return null;
    }

    // Pass the server-fetched data to the client component
    return <FloatingMiniBillboard initialData={validData} />;
  } catch (error) {
    // Log error server-side only (won't appear in browser console)
    console.error('[Server] Error fetching billboard data:', error);
    if (error instanceof Error) {
      console.error('[Server] Error message:', error.message);
      console.error('[Server] Error stack:', error.stack);
    }
    // Silently fail - don't show the widget if data fetch fails
    return null;
  }
}
