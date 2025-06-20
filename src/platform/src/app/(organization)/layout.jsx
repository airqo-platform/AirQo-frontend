'use client';

import { withSessionAuth, PROTECTION_LEVELS } from '@/core/HOC';
import Loading from '../loading';
import { useSession } from 'next-auth/react';

/**
 * Organization Route Group Layout
 * Ensures authentication is required for all pages in the (organization) route group
 * The withSessionAuth HOC handles organization-specific redirects automatically
 */
function OrganizationLayout({ children }) {
  const { status } = useSession();

  // Show loading while authentication is being checked
  if (status === 'loading') {
    return <Loading />;
  }

  return children;
}

export default withSessionAuth(PROTECTION_LEVELS.PROTECTED)(OrganizationLayout);
