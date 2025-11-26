'use client';

import { withSessionAuth, PROTECTION_LEVELS } from '@/core/HOC';

export function OrganizationPagesLayoutWrapper({ children }) {
  // Organization context is now provided by UnifiedGroupProvider at the app level
  return <>{children}</>;
}

export default withSessionAuth(
  OrganizationPagesLayoutWrapper,
  PROTECTION_LEVELS.PROTECTED,
);
