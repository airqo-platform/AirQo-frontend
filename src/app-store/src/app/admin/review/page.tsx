'use client';

import { RouteGuard } from '@/components/layout/accessConfig/route-guard';
import { PERMISSIONS, RoleName } from '@/core/permissions/constants';

export default function AdminReviewPage() {
  return (
    <RouteGuard
      roles={['AIRQO_SUPER_ADMIN', 'AIRQO_SYSTEM_ADMIN'] as RoleName[]}
      permissions={[PERMISSIONS.SYSTEM.SUPER_ADMIN, PERMISSIONS.SYSTEM.SYSTEM_ADMIN]}
      requiresAirqoEmail
      showError
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h1 className="text-2xl font-semibold text-heading">App Review Queue</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Approve or reject submitted apps before they appear in the store.
          </p>
        </section>

        <section className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
          No submissions yet. This view will connect to the backend review API.
        </section>
      </div>
    </RouteGuard>
  );
}
