'use client';

import {
  AqGood,
  AqHazardous,
  AqModerate,
  AqNoValue,
  AqUnhealthy,
  AqUnhealthyForSensitiveGroups,
  AqVeryUnhealthy,
} from '@airqo/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import {
  useGridRepresentativeReading,
  useGridsSummary,
} from '@/hooks/useApiHooks';
import type { Grid } from '@/types/grids';
import {
  categoryToLevel,
  formatName,
  getAirQualityCategory,
  getAirQualityColor,
} from '@/utils/airQuality';

const ROTATION_INTERVAL = 15000; // 15 seconds per grid

// Get appropriate icon for air quality level
const getAirQualityIcon = (category: string) => {
  const level = categoryToLevel(category);
  const color = getAirQualityColor(category);
  const iconProps = {
    className: `w-12 h-12`,
    style: { color },
  };

  switch (level) {
    case 'good':
      return <AqGood {...iconProps} />;
    case 'moderate':
      return <AqModerate {...iconProps} />;
    case 'unhealthy-sensitive-groups':
      return <AqUnhealthyForSensitiveGroups {...iconProps} />;
    case 'unhealthy':
      return <AqUnhealthy {...iconProps} />;
    case 'very-unhealthy':
      return <AqVeryUnhealthy {...iconProps} />;
    case 'hazardous':
      return <AqHazardous {...iconProps} />;
    default:
      return <AqNoValue {...iconProps} />;
  }
};

// Loading skeleton for smooth transitions
const LoadingSkeleton = () => (
  <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg shadow-2xl p-4 w-64 relative animate-pulse">
    <div className="flex items-start justify-between mb-2">
      <div className="flex-1">
        <div className="h-3 bg-white/20 rounded w-16 mb-2"></div>
        <div className="h-5 bg-white/30 rounded w-32"></div>
      </div>
    </div>
    <div className="flex items-center gap-3 mt-4">
      <div className="flex-1">
        <div className="h-8 bg-white/30 rounded w-20 mb-2"></div>
        <div className="h-3 bg-white/20 rounded w-24"></div>
      </div>
      <div className="w-12 h-12 bg-white/20 rounded-full"></div>
    </div>
    <div className="mt-3 pt-3 border-t border-white/20">
      <div className="h-3 bg-white/20 rounded w-24"></div>
    </div>
  </div>
);

export default function FloatingMiniBillboard() {
  const pathname = usePathname();
  const [currentGridIndex, setCurrentGridIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Fetch grids data with country admin level - cached to avoid repeated calls
  const { data: gridsData, isLoading } = useGridsSummary({
    admin_level: 'country',
    limit: 20, // Fetch more to account for those without data
    page: 1,
  });

  // Get current grid from rotation
  const currentGrid: Grid | null = gridsData?.grids?.[currentGridIndex] || null;

  // Fetch reading for current grid - also cached
  const { data: readingData } = useGridRepresentativeReading(
    currentGrid?._id || null,
  );

  const pm25Value = readingData?.data?.pm2_5?.value;
  const hasValidData = pm25Value != null && pm25Value >= 0;
  const category = getAirQualityCategory(pm25Value, 'pm2_5');
  const categoryLabel =
    category === 'UnhealthyForSensitiveGroups'
      ? 'Unhealthy for Sensitive Groups'
      : category;

  // Check if we should hide on billboard pages
  const shouldHide = pathname?.startsWith('/billboard');

  useEffect(() => {
    // Check screen size - only show on medium screens and above, and not on billboard pages
    const checkScreenSize = () => {
      setIsVisible(window.innerWidth >= 768 && !shouldHide);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, [shouldHide]);

  useEffect(() => {
    if (!isVisible || !gridsData?.grids?.length) return;

    // Set up rotation interval
    intervalRef.current = setInterval(() => {
      setIsTransitioning(true);
      // Delay index change for fade out effect
      setTimeout(() => {
        setCurrentGridIndex(
          (prev) => (prev + 1) % (gridsData?.grids?.length || 1),
        );
        // Fade back in
        setTimeout(() => setIsTransitioning(false), 100);
      }, 300);
    }, ROTATION_INTERVAL);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isVisible, gridsData?.grids?.length]);

  // Skip grids without valid data automatically with smooth transition
  useEffect(() => {
    if (!isVisible || !gridsData?.grids?.length || isLoading) return;

    // If current grid has no data, move to next one smoothly
    if (!hasValidData && readingData !== undefined) {
      setIsTransitioning(true);
      setTimeout(() => {
        const nextIndex =
          (currentGridIndex + 1) % (gridsData?.grids?.length || 1);
        setCurrentGridIndex(nextIndex);
        setTimeout(() => setIsTransitioning(false), 100);
      }, 300);
    }
  }, [
    hasValidData,
    readingData,
    isVisible,
    gridsData?.grids?.length,
    currentGridIndex,
    isLoading,
  ]);

  // Don't show if hidden or initial loading
  if (!isVisible || isLoading || !gridsData?.grids?.length) return null;

  // Show loading skeleton during transition
  if (isTransitioning || !currentGrid || !hasValidData) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <LoadingSkeleton />
      </div>
    );
  }

  const displayValue = pm25Value.toFixed(2);
  const gridName = formatName(currentGrid.name);

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg transition-all duration-300 text-sm font-medium"
        aria-label="Show air quality widget"
      >
        {gridName}: {displayValue} PM2.5
      </button>
    );
  }

  return (
    <Link
      href="/solutions/african-cities#grids-section"
      className="fixed bottom-6 right-6 z-50 block"
      aria-label={`View air quality for ${gridName}`}
      scroll={true}
    >
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg shadow-2xl p-4 w-64 hover:scale-105 transition-all duration-300 relative animate-fade-in">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMinimized(true);
          }}
          className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Minimize widget"
        >
          <span className="text-white text-xl leading-none">×</span>
        </button>

        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs opacity-80 uppercase tracking-wide">
              Air Quality
            </p>
            <h3 className="text-lg font-bold truncate pr-6">{gridName}</h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">{displayValue}</span>
              <span className="text-xs opacity-70">PM2.5</span>
            </div>
            <p className="text-xs mt-1 opacity-90">{categoryLabel}</p>
          </div>

          <div className="flex items-center justify-center" aria-hidden="true">
            {getAirQualityIcon(category)}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/20">
          <p className="text-xs opacity-80">Discover more</p>
        </div>
      </div>
    </Link>
  );
}
