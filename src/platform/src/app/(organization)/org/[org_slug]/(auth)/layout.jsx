'use client';

export default function OrganizationAuthLayout({ children }) {
  // Organization context is now provided by UnifiedGroupProvider at the app level
  return <>{children}</>;
}
