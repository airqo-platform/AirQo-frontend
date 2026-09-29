'use client';

import React from 'react';
import { PermissionGuard } from '@/shared/components/PermissionGuard';
import BillingSubnav from '@/modules/system-billing/components/BillingSubnav';

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PermissionGuard requiredPermissions={['SYSTEM_ADMIN', 'SUPER_ADMIN']}>
      <div className="space-y-6">
        <BillingSubnav />
        <div className="px-1">{children}</div>
      </div>
    </PermissionGuard>
  );
}
