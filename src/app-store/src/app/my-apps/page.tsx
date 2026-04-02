'use client';

import Link from 'next/link';
import ReusableButton from '@/components/shared/button/ReusableButton';

const createdApps = [
  {
    id: 'pm25-trend-explorer',
    name: 'PM2.5 Trend Explorer',
    status: 'Live',
    lastUpdated: 'Apr 2, 2026',
  },
];

const savedApps = [
  {
    id: 'spatial-analysis',
    name: 'Air Quality Spatial Analysis',
    author: 'AirQo Research',
  },
];

export default function MyAppsPage() {
  const hasCreatedApps = createdApps.length > 0;
  const hasSavedApps = savedApps.length > 0;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold text-heading">My Apps</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track the apps you&apos;ve created and the apps you&apos;ve saved from the catalogue.
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-heading">Created Apps</h2>
            <p className="text-sm text-muted-foreground">
              Apps you&apos;ve published or are preparing to publish.
            </p>
          </div>
          <ReusableButton asChild>
            <Link href="/publish">Publish an App</Link>
          </ReusableButton>
        </div>

        {hasCreatedApps ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">App</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Last Updated</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {createdApps.map(app => (
                  <tr key={app.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-foreground">{app.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{app.status}</td>
                    <td className="px-4 py-3 text-muted-foreground">{app.lastUpdated}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/data-apps/${app.id}/about`}
                        className="text-primary hover:underline"
                      >
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            You haven&apos;t published any apps yet. Start with the Observable template and
            connect your GitHub repo when you&apos;re ready.
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-heading">Saved Apps</h2>
            <p className="text-sm text-muted-foreground">
              Apps you&apos;ve bookmarked for quick access later.
            </p>
          </div>
          <ReusableButton variant="outlined" asChild>
            <Link href="/data-apps">Browse Data Apps</Link>
          </ReusableButton>
        </div>

        {hasSavedApps ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {savedApps.map(app => (
              <div key={app.id} className="rounded-2xl border border-border bg-muted/30 p-4">
                <p className="text-sm font-semibold text-heading">{app.name}</p>
                <p className="text-xs text-muted-foreground">By {app.author}</p>
                <Link
                  href={`/data-apps/${app.id}/about`}
                  className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
                >
                  View details
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            You haven&apos;t saved any apps yet. Browse the catalogue and save your favorites.
          </div>
        )}
      </section>
    </div>
  );
}
