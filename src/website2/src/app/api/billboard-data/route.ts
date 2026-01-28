import { NextResponse } from 'next/server';

import gridsService from '@/services/apiService/grids';
import { Grid } from '@/types/grids';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes

interface BillboardData {
  grid: Grid;
  reading: {
    pm2_5?: {
      value: number;
    };
  } | null;
}

/**
 * Server-side API route to fetch billboard data
 * This prevents exposing the internal API calls on the client
 */
export async function GET() {
  try {
    // Fetch grids summary
    const gridsData = await gridsService.getGridsSummary({
      admin_level: 'country',
      limit: 20,
      page: 1,
    });

    if (!gridsData?.grids || gridsData.grids.length === 0) {
      return NextResponse.json(
        { error: 'No grids available' },
        { status: 404 },
      );
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
      return NextResponse.json(
        { error: 'No valid air quality data available' },
        { status: 404 },
      );
    }

    // Return with cache headers
    return NextResponse.json(validData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching billboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billboard data' },
      { status: 500 },
    );
  }
}
