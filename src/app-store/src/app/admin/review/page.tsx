'use client';

import { useUserAccess } from '@/core/hooks/useUserAccess';

export default function AdminReviewPage() {
  const { isAdmin } = useUserAccess();

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
        Admin review queue is only visible to AirQo SUPER_ADMIN accounts.
      </div>
    );
  }

  return (
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
  );
}
