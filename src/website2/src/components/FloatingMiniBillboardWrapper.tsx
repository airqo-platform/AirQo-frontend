'use client';

import { useEffect, useState } from 'react';

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
 * Client-side wrapper that fetches billboard data from API route
 * Handles errors gracefully and provides fallback UI
 */
export default function FloatingMiniBillboardWrapper() {
  const [data, setData] = useState<BillboardData[] | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const fetchData = async () => {
      try {
        const response = await fetch('/api/billboard-data', {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (mounted && result?.data) {
          setData(result.data);
          setError(false);
        }
      } catch (err) {
        console.error('[FloatingBillboard] Failed to fetch data:', err);
        if (mounted) {
          setError(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []);

  // Don't render anything while loading or if there's an error
  if (loading || error || !data || data.length === 0) {
    return null;
  }

  return <FloatingMiniBillboard initialData={data} />;
}
