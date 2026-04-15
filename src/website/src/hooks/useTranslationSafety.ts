'use client';

import { useRouter } from 'next/navigation';

import { isGoogleTranslationActive } from '@/utils/googleTranslate';

/**
 * Safe navigation wrapper that handles translation state gracefully
 * Simplified to avoid performance overhead
 */

export const useSafeNavigation = () => {
  const router = useRouter();

  const navigateSafely = (href: string) => {
    try {
      const isTranslated = isGoogleTranslationActive();

      // If translated, use window.location for clean navigation
      if (isTranslated) {
        window.location.href = href;
      } else {
        router.push(href);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to window.location
      window.location.href = href;
    }
  };

  return { navigateSafely };
};
