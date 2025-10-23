'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { NormalizedChartData, ChartType, AirQualityDataPoint } from '../types';
import {
  normalizeAirQualityData,
  autoSelectChartType,
  calculateDataStats,
} from '../utils';

interface UseChartDataOptions {
  data?: AirQualityDataPoint[];
  autoRefresh?: boolean;
  refreshInterval?: number;
  chartType?: ChartType;
  enableAutoSelection?: boolean;
}

interface UseChartDataReturn {
  normalizedData: NormalizedChartData[];
  chartType: ChartType;
  loading: boolean;
  error: string | null;
  stats: {
    min: number;
    max: number;
    avg: number;
    median: number;
    count: number;
  };
  refresh: () => void;
  setChartType: (type: ChartType) => void;
}

export const useChartData = ({
  data = [],
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
  chartType,
  enableAutoSelection = true,
}: UseChartDataOptions = {}): UseChartDataReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChartType, setSelectedChartType] = useState<
    ChartType | undefined
  >(chartType);

  // Normalize and process data
  const normalizedData = useMemo(() => {
    try {
      setError(null);
      return normalizeAirQualityData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to process chart data'
      );
      return [];
    }
  }, [data]);

  // Determine chart type
  const finalChartType = useMemo(() => {
    if (selectedChartType) return selectedChartType;
    if (enableAutoSelection) return autoSelectChartType(normalizedData);
    return 'line';
  }, [selectedChartType, enableAutoSelection, normalizedData]);

  // Calculate statistics
  const stats = useMemo(() => {
    return calculateDataStats(normalizedData);
  }, [normalizedData]);

  // Refresh function
  const refresh = useCallback(() => {
    setLoading(true);
    // Simulate refresh delay
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  // Auto refresh effect
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    normalizedData,
    chartType: finalChartType,
    loading,
    error,
    stats,
    refresh,
    setChartType: setSelectedChartType,
  };
};

// Hook for responsive chart sizing
interface UseResponsiveChartOptions {
  breakpoints?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

interface UseResponsiveChartReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  dimensions: {
    width: number;
    height: number;
  };
  screenSize: 'mobile' | 'tablet' | 'desktop';
}

export const useResponsiveChart = ({
  breakpoints = {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
  },
}: UseResponsiveChartOptions = {}): UseResponsiveChartReturn => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>(
    'desktop'
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }

      // Determine screen size
      const windowWidth = window.innerWidth;
      if (windowWidth < breakpoints.mobile) {
        setScreenSize('mobile');
      } else if (windowWidth < breakpoints.tablet) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, [breakpoints]);

  return {
    containerRef,
    dimensions,
    screenSize,
  };
};

// Hook for chart performance optimization
interface UseChartPerformanceOptions {
  dataThreshold?: number;
  debounceMs?: number;
}

export const useChartPerformance = ({
  dataThreshold = 1000,
  debounceMs = 300,
}: UseChartPerformanceOptions = {}) => {
  const [optimizedData, setOptimizedData] = useState<NormalizedChartData[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const optimizeData = useCallback(
    (data: NormalizedChartData[]) => {
      if (data.length <= dataThreshold) {
        return data;
      }

      setIsOptimizing(true);

      // Sample data points for better performance
      const step = Math.ceil(data.length / dataThreshold);
      const optimized = data.filter((_, index) => index % step === 0);

      setIsOptimizing(false);
      return optimized;
    },
    [dataThreshold]
  );

  const debouncedOptimize = useMemo(() => {
    let timeoutId: NodeJS.Timeout;

    return (data: NormalizedChartData[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const optimized = optimizeData(data);
        setOptimizedData(optimized);
      }, debounceMs);
    };
  }, [optimizeData, debounceMs]);

  return {
    optimizedData,
    isOptimizing,
    optimizeData: debouncedOptimize,
  };
};
