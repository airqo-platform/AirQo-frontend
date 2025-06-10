'use client';

import { withAdminAccess } from '@/core/utils/nextAuthProtectedRoute';
import PagesLayout from '@/common/layouts/PagesLayout';

function AdminLayout({ children }) {
  return <PagesLayout>{children}</PagesLayout>;
}

export default withAdminAccess(AdminLayout);
