'use client';

export default function OrganizationPagesLayoutWrapper({ children }) {
  // Organization context is now provided by UnifiedGroupProvider at the app level
  return <>{children}</>;
}
