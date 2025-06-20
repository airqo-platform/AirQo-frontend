'use client';

import { withSessionAuth, PROTECTION_LEVELS } from '@/core/HOC';

function OrganizationAuthLayout({ children }) {
  // Only render auth pages for unauthenticated users
  // The HOC handles redirecting authenticated users to appropriate organization dashboard
  // Organization context is now provided by UnifiedGroupProvider at the app level
  return <>{children}</>;
}

export default withSessionAuth(PROTECTION_LEVELS.AUTH_ONLY)(
  OrganizationAuthLayout,
);
