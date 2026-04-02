'use client';

import Link from 'next/link';
import ReusableButton from '@/components/shared/button/ReusableButton';

export default function PublishPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold text-heading">Publish a Data App</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Connect your GitHub repo to enable automated builds and deploys. This flow will be
          wired to GitHub OAuth in Phase 3.
        </p>
      </section>

      <section className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
        GitHub connection UI coming soon. Make sure your repo includes `.airqo/manifest.json` and
        follows the Observable Framework template structure.
        <div className="mt-4 flex flex-wrap gap-3">
          <ReusableButton variant="outlined" asChild>
            <Link href="/docs/getting-started">Review Getting Started</Link>
          </ReusableButton>
          <ReusableButton variant="text" asChild>
            <Link href="/data-apps">Browse Data Apps</Link>
          </ReusableButton>
        </div>
      </section>
    </div>
  );
}
