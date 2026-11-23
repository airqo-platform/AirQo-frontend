'use client';

import * as React from 'react';
import { LoadingOverlay } from '../ui/loading-overlay';

/*
 * Full-screen loader shown while the user switches organisation:
 * "Switching to <name>" with "Updating your workspace, and opening fresh content."
 *
 * Copied from nexus/src/shared/components/ui/group-switch-overlay.tsx, which
 * renders nothing itself and asks Nexus's GlobalLoadingProvider to show its
 * LoadingOverlay with this text (default delay 150 ms). That file's timers (clear
 * once the new group and destination page are reached, 15 s failsafe) stay in
 * the app, which sets `switchingTo` back to null when the switch is done.
 *
 * Vertex shows a thin progress bar across the top instead (./navigation-progress).
 * Beacon replaces the page content with "Updating active group..." (ui/loading-state).
 */
interface OrganisationSwitchOverlayProps {
  /** Name of the organisation being switched to; null or empty hides the overlay. */
  switchingTo?: string | null;
  /** Delay before showing, so fast switches don't flash. */
  delayMs?: number;
}

export function OrganisationSwitchOverlay({
  switchingTo,
  delayMs = 150,
}: Readonly<OrganisationSwitchOverlayProps>) {
  return (
    <LoadingOverlay
      isVisible={Boolean(switchingTo)}
      delayMs={delayMs}
      title={switchingTo ? `Switching to ${switchingTo}` : undefined}
      description={
        switchingTo
          ? 'Updating your workspace, and opening fresh content.'
          : undefined
      }
    />
  );
}

export default OrganisationSwitchOverlay;
