import { Viewport } from 'next';

/**
 * Generate viewport configuration separately (Next.js 14.2+ requirement)
 * @returns Viewport configuration object
 */
export function generateViewport(): Viewport {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
  };
}
