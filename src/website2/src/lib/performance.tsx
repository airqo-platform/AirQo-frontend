import dynamic from 'next/dynamic';
import React, { ComponentType } from 'react';

// Dynamic import wrapper with loading states
export const createOptimizedComponent = <T extends Record<string, any>>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  fallback?: ComponentType,
) => {
  return dynamic(importFn, {
    loading: () => (fallback ? React.createElement(fallback) : null),
    ssr: true,
  });
};

// Lazy load components that are not critical for LCP
export const LazyComponents = {
  EngagementDialog: dynamic(
    () => import('@/components/dialogs/EngagementDialog'),
    {
      ssr: false,
    },
  ),
  // Add more components as needed
};

// Image preloader for critical images
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Critical images that should be preloaded
export const CRITICAL_IMAGES = [
  'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132435/website/photos/AirQuality_meyioj.webp',
  'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728138368/website/Logos/logo_rus4my.png',
] as const;

// Preload critical images
export const preloadCriticalImages = () => {
  if (typeof window !== 'undefined') {
    CRITICAL_IMAGES.forEach((src) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }
};
