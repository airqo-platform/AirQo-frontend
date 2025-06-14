'use client';

import { withAdminAccess } from '@/core/HOC';
import PagesLayout from '@/common/layouts/pages/PagesLayout';

function AdminLayout({ children }) {
  return <PagesLayout>{children}</PagesLayout>;
}

export default withAdminAccess(AdminLayout);
