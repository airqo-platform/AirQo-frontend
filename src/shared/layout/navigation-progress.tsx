'use client';

import * as React from 'react';

/*
 * Thin bar across the top of the window while a page or organisation is loading.
 *
 * Copied from vertex/components/layout/layout.tsx, which shows it while the
 * organisation is switching (Redux `organizationSwitching.isSwitching`) or after a
 * sidebar click until the new path renders. Nexus shows a full overlay for the
 * same moment (./organisation-switch-overlay); Beacon shows neither.
 *
 * Needs the `shimmer` keyframes and `animate-shimmer` utility from Vertex's
 * tailwind.config.ts (translateX -100% to 100%, 1.5s linear, infinite).
 */
interface NavigationProgressProps {
  active: boolean;
}

export function NavigationProgress({ active }: Readonly<NavigationProgressProps>) {
  if (!active) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[10001]">
      <div className="h-1 bg-primary/20 w-full overflow-hidden">
        <div className="h-full bg-primary animate-shimmer"></div>
      </div>
    </div>
  );
}

export default NavigationProgress;
