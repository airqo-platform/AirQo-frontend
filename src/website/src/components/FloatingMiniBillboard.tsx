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

import type { Grid } from '@/types/grids';
import {
  categoryToLevel,
  formatName,
  getAirQualityCategory,
  getAirQualityColor,
} from '@/utils/airQuality';

const ROTATION_INTERVAL = 15000; // 15 seconds per grid

interface BillboardData {
  grid: Grid;
  reading: {
    pm2_5?: {
      value: number;
    };
  } | null;
}

interface FloatingMiniBillboardProps {
  initialData?: BillboardData[];
}

// Get appropriate icon for air quality level
const getAirQualityIcon = (category: string) => {
  const level = categoryToLevel(category);
  const color = getAirQualityColor(category);
  const iconProps = {
    className: `w-10 h-10 md:w-12 md:h-12`,
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

export default function FloatingMiniBillboard({
  initialData,
}: FloatingMiniBillboardProps) {
  const pathname = usePathname();
  const [currentGridIndex, setCurrentGridIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Get current grid from rotation
  const currentItem = initialData?.[currentGridIndex];
  const currentGrid = currentItem?.grid;
  const readingData = currentItem?.reading;

  const pm25Value = readingData?.pm2_5?.value;
  const hasValidData = pm25Value != null && pm25Value >= 0;
  const category = getAirQualityCategory(pm25Value, 'pm2_5');
  const categoryLabel =
    category === 'UnhealthyForSensitiveGroups'
      ? 'Unhealthy for Sensitive Groups'
      : category;

  // Check if we should hide on billboard pages
  const shouldHide = pathname?.startsWith('/billboard');

  // Handle component mounting to avoid showing during SSR/initial load
  useEffect(() => {
    // Delay mounting to ensure page is ready
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100); // Reduced from 1000ms to 100ms

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Show on all screen sizes, but not on billboard pages
    const checkScreenSize = () => {
      setIsVisible(!shouldHide);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, [shouldHide, isMounted]);

  useEffect(() => {
    if (!isVisible || !initialData?.length) return;

    // Set up rotation interval
    intervalRef.current = setInterval(() => {
      setIsTransitioning(true);
      // Delay index change for fade out effect
      setTimeout(() => {
        setCurrentGridIndex((prev) => (prev + 1) % (initialData?.length || 1));
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
  }, [isVisible, initialData?.length]);

  // Don't show if not mounted, hidden, no data, or during transition without valid data
  if (
    !isMounted ||
    !isVisible ||
    !initialData?.length ||
    !currentGrid ||
    !hasValidData
  ) {
    return null;
  }

  const displayValue = pm25Value.toFixed(2);
  const gridName = formatName(currentGrid.name);

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-50 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-lg transition-all duration-300 text-xs md:text-sm font-medium max-w-[90vw] md:max-w-none truncate"
        aria-label="Show air quality widget"
      >
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-white/80 animate-pulse"></span>
          {gridName}: {displayValue} PM2.5
        </span>
      </button>
    );
  }4 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-50 block max-w-[calc(100vw-2rem)] md:max-w-none">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsMinimized(true);
        }}
        className="absolute top-1.5 right-1.5 md:top-2 md:right-2 p-0.5 md:p-1 hover:bg-white/20 active:bg-white/30 rounded-full transition-colors z-10"
        aria-label="Minimize widget"
      >
        <span className="text-white text-lg md:text-xl leading-none">×</span>
      </button>

      <Link
        href="/solutions/african-cities#grids-section"
        className="block"
        aria-label={`View air quality for ${gridName}`}
        scroll={true}
      >
        <div
          className={`bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg shadow-2xl p-3 md:p-4 w-[280px] sm:w-[300px] md:w-64 hover:scale-105 active:scale-[1.02] md:active:scale-105 transition-all duration-300 relative ${
            isTransitioning ? 'opacity-0' : 'opacity-100 animate-fade-in'
          }`}
        >
          {/* Header Section */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 pr-6">
              <p className="text-[10px] md:text-xs opacity-80 uppercase tracking-wide">
                Air Quality
              </p>
              <h3 className="text-base md:text-lg font-bold truncate">
                {gridName}
              </h3>
            </div>
          </div>

          {/* Main Content - Air Quality Data */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex-1">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl md:text-3xl font-bold">
                  {displayValue}
                </span>
                <span className="text-[10px] md:text-xs opacity-70">PM2.5</span>
              </div>
              <p className="text-xs md:text-sm mt-0.5 md:mt-1 opacity-90 font-medium">
                {categoryLabel}
              </p>
            </div>

            {/* Icon */}
            <div
              className="flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              {getAirQualityIcon(category)}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/20">
            <p className="text-[10px] md:text-xs opacity-80">Discover more →

          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-xs opacity-80">Discover more</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
