'use client';

import { withAdminAccess } from '@/core/utils/nextAuthProtectedRoute';

function AdminLayout({ children }) {
  return <>{children}</>;
}

export default withAdminAccess(AdminLayout);
