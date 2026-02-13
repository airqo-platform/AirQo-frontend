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
    className: `w-full h-full`,
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
  const [isCompact, setIsCompact] = useState(false);
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
    // On mobile/tablet, start compact
    const checkScreenSize = () => {
      const isMobile = window.innerWidth < 768;
      setIsVisible(!shouldHide);
      setIsCompact(isMobile);
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

  // Minimized compact state (hidden completely)
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-3 left-1/2 -translate-x-1/2 md:bottom-6 md:left-auto md:right-6 md:translate-x-0 z-[9999] bg-blue-600/95 backdrop-blur-sm hover:bg-blue-700 active:bg-blue-800 text-white px-2.5 py-1 md:px-4 md:py-2 rounded-full shadow-lg transition-all duration-300 text-[10px] md:text-sm font-medium max-w-[85vw] md:max-w-none truncate touch-manipulation"
        aria-label="Show air quality widget"
      >
        <span className="flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white/80 animate-pulse"></span>
          <span className="hidden sm:inline">{gridName}: </span>
          <span>{displayValue} PM2.5</span>
        </span>
      </button>
    );
  }

  // Super compact mobile badge (shows by default on mobile)
  if (isCompact) {
    return (
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[9999] block">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMinimized(true);
          }}
          className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-blue-800/90 backdrop-blur-sm rounded-full shadow-md z-10 touch-manipulation"
          aria-label="Minimize widget"
        >
          <span className="text-white text-sm leading-none">×</span>
        </button>

        <Link
          href="/solutions/african-cities#grids-section"
          className="block touch-manipulation"
          aria-label={`View air quality for ${gridName}`}
          scroll={true}
        >
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg shadow-xl p-2 w-[200px] active:scale-95 transition-all duration-200">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0">
                <div className="w-8 h-8">{getAirQualityIcon(category)}</div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] opacity-70 uppercase tracking-wide truncate">
                  {gridName}
                </p>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-lg font-bold">{displayValue}</span>
                  <span className="text-[8px] opacity-60">PM2.5</span>
                </div>
                <p className="text-[9px] opacity-80 font-medium truncate">
                  {categoryLabel}
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // Desktop/tablet view
  return (
    <div className="fixed bottom-6 right-6 z-[9999] block max-w-[calc(100vw-2rem)]">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsMinimized(true);
        }}
        className="absolute top-2 right-2 p-1 hover:bg-white/20 active:bg-white/30 rounded-full transition-colors z-10 touch-manipulation"
        aria-label="Minimize widget"
      >
        <span className="text-white text-xl leading-none">×</span>
      </button>

      <Link
        href="/solutions/african-cities#grids-section"
        className="block touch-manipulation"
        aria-label={`View air quality for ${gridName}`}
        scroll={true}
      >
        <div
          className={`bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg shadow-2xl p-4 w-64 hover:scale-105 transition-all duration-300 relative ${
            isTransitioning ? 'opacity-0' : 'opacity-100 animate-fade-in'
          }`}
        >
          {/* Header Section */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 pr-6">
              <p className="text-xs opacity-80 uppercase tracking-wide">
                Air Quality
              </p>
              <h3 className="text-lg font-bold truncate">{gridName}</h3>
            </div>
          </div>

          {/* Main Content - Air Quality Data */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{displayValue}</span>
                <span className="text-xs opacity-70">PM2.5</span>
              </div>
              <p className="text-xs mt-1 opacity-90">{categoryLabel}</p>
            </div>

            {/* Icon */}
            <div
              className="flex items-center justify-center shrink-0 w-8 h-8"
              aria-hidden="true"
            >
              {getAirQualityIcon(category)}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-xs opacity-80">Discover more →</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
