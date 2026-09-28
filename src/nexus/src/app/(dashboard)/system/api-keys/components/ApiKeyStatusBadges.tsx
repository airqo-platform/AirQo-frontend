'use client';

import React from 'react';
import type { ApiKeyUsageKey } from '@/shared/types/apiKeyUsage';

const BADGE_BASE =
  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium';

export interface StatusBadge {
  key: string;
  label: string;
  className: string;
}

const TIER_BADGE: StatusBadge = {
  key: 'tier',
  label: '',
  className: `${BADGE_BASE} bg-primary/10 text-primary`,
};

const SUSPENDED_BADGE: StatusBadge = {
  key: 'suspended',
  label: 'Suspended',
  className: `${BADGE_BASE} bg-red-100 text-red-800`,
};

const DELETED_BADGE: StatusBadge = {
  key: 'deleted',
  label: 'Deleted',
  className: `${BADGE_BASE} bg-gray-100 text-gray-800`,
};

const INACTIVE_BADGE: StatusBadge = {
  key: 'inactive',
  label: 'Inactive',
  className: `${BADGE_BASE} bg-amber-100 text-amber-800`,
};

export interface ApiKeyStatusBadgesProps {
  apiKey: Pick<
    ApiKeyUsageKey,
    'tier' | 'auto_suspended' | 'deleted' | 'client_active'
  >;
  /** Renders the subscription tier chip before the status chips. */
  showTier?: boolean;
  className?: string;
}

/**
 * Status chips for one API key (suspended / deleted / inactive), shared by the
 * leaderboard rows and the key detail card so both surfaces flag the same keys
 * with the same colours.
 */
const ApiKeyStatusBadges: React.FC<ApiKeyStatusBadgesProps> = ({
  apiKey,
  showTier = false,
  className,
}) => {
  const badges = [
    ...(showTier && apiKey.tier ? [TIER_BADGE] : []),
    ...(apiKey.auto_suspended ? [SUSPENDED_BADGE] : []),
    ...(apiKey.deleted ? [DELETED_BADGE] : []),
    ...(apiKey.client_active === false ? [INACTIVE_BADGE] : []),
  ];

  if (badges.length === 0) return null;

  return (
    <div className={className ?? 'flex flex-wrap gap-1'}>
      {badges.map(badge => (
        <span key={badge.key} className={badge.className}>
          {badge.key === 'tier' ? apiKey.tier : badge.label}
        </span>
      ))}
    </div>
  );
};

export default ApiKeyStatusBadges;
