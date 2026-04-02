'use client';

import Link from 'next/link';
import ReusableButton from '@/components/shared/button/ReusableButton';

const pilotApps = [
  {
    id: 'pm25-trend-explorer',
    name: 'PM2.5 Trend Explorer',
    description:
      'Interactive trends, rolling averages, and guideline insights for PM2.5 and PM10 across AirQo sites.',
    category: 'EDA',
  },
  {
    id: 'spatial-analysis',
    name: 'Air Quality Spatial Analysis',
    description:
      'Map-first exploration of pollutant readings across Africa using interactive geospatial views.',
    category: 'Spatial Analysis',
  },
  {
    id: 'who-exceedance-report',
    name: 'WHO Exceedance Report',
    description:
      'Compliance-focused reporting on how often sites exceed WHO air quality guidelines.',
    category: 'Reporting',
  },
];

export default function DataAppsCataloguePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-heading">Data Apps Catalogue</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse interactive data apps built on top of AirQo air quality data.
            </p>
          </div>
          <ReusableButton asChild>
            <Link href="/publish">Publish an App</Link>
          </ReusableButton>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {pilotApps.map(app => (
          <div key={app.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {app.category}
            </div>
            <h2 className="mt-2 text-lg font-semibold text-heading">{app.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{app.description}</p>
            <div className="mt-4">
              <Link href={`/data-apps/${app.id}/about`} className="text-sm font-semibold text-primary hover:underline">
                View details
              </Link>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
        Catalogue data will be loaded from the App Registry API in Phase 2.
      </section>
    </div>
  );
}
