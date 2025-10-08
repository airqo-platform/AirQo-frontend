'use client';

import { withSessionAuth, PROTECTION_LEVELS } from '@/core/HOC';

function OrganizationAuthLayout({ children }) {
  return <>{children}</>;
}

export default withSessionAuth(
  OrganizationAuthLayout,
  PROTECTION_LEVELS.AUTH_ONLY,
);
