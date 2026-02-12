'use client';

import { useRouter } from 'next/navigation';

/**
 * Safe navigation wrapper that handles translation state gracefully
 * Simplified to avoid performance overhead
 */

export const useSafeNavigation = () => {
  const router = useRouter();

  const navigateSafely = (href: string) => {
    try {
      // Check if translation is active by looking at the cookie
      const googtrans = document.cookie
        .split('; ')
        .find((row) => row.startsWith('googtrans='));
      const isTranslated = googtrans && googtrans.includes('/');

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
