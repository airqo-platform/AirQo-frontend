'use client';

import { withAdminAccess } from '@/core/utils/nextAuthProtectedRoute';
import PagesLayout from '@/common/layouts/pages/PagesLayout';

function AdminLayout({ children }) {
  return <PagesLayout>{children}</PagesLayout>;
}

export default withAdminAccess(AdminLayout);
