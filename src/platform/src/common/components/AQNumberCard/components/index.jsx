import React, { useEffect } from 'react';

import GoodAir from '@/icons/Charts/GoodAir';
import Hazardous from '@/icons/Charts/Hazardous';
import Moderate from '@/icons/Charts/Moderate';
import Unhealthy from '@/icons/Charts/Unhealthy';
import UnhealthySG from '@/icons/Charts/UnhealthySG';
import VeryUnhealthy from '@/icons/Charts/VeryUnhealthy';
import UnknownAQ from '@/icons/Charts/Invalid';
import WindIcon from '@/icons/Common/wind.svg';
import TrendDownIcon from '@/icons/Analytics/trendDownIcon';
import TrendUpIcon from '@/icons/Analytics/trendUpIcon';

export const IconMap = {
  good: GoodAir,
  moderate: Moderate,
  'unhealthy-sensitive': UnhealthySG,
  unhealthy: Unhealthy,
  'very-unhealthy': VeryUnhealthy,
  hazardous: Hazardous,
  unknown: UnknownAQ,
  wind: WindIcon,
  trend1: TrendDownIcon,
  trend2: TrendUpIcon,
};

// ====================== Custom Hooks ====================== //

/**
 * Custom hook to handle ResizeObserver
 * @param {React.RefObject} ref - The ref to observe
 * @param {Function} callback - The callback to execute on resize
 */
export const useResizeObserver = (ref, callback) => {
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !ref.current ||
      !window.ResizeObserver
    ) {
      return;
    }

    const observer = new window.ResizeObserver(callback);
    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, callback]);
};

// ====================== SkeletonCard Component ====================== //

export const SkeletonCard = React.memo(() => (
  <div className="w-full border border-gray-200 bg-white rounded-xl px-4 py-6">
    <div className="flex flex-col justify-between h-[168px]">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2 flex-1">
          <div className="h-6 bg-gray-200 rounded-md w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded-md w-1/2 animate-pulse" />
        </div>
        <div className="h-8 w-16 bg-gray-200 rounded-xl animate-pulse ml-2" />
      </div>
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded-md w-16 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded-md w-24 animate-pulse" />
        </div>
        <div className="h-16 w-16 bg-gray-200 rounded-full animate-pulse" />
      </div>
    </div>
  </div>
));

SkeletonCard.displayName = 'SkeletonCard';
