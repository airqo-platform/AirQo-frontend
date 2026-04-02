'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import ReusableButton from '@/components/shared/button/ReusableButton';

const pilotApps = [
  {
    id: 'pm25-trend-explorer',
    name: 'PM2.5 Trend Explorer',
    description:
      'Interactive trends, rolling averages, and guideline insights for PM2.5 and PM10 across AirQo sites.',
    category: 'EDA',
    apis: ['Chart Data', 'Recent Measurements'],
    parameterised: true,
  },
  {
    id: 'spatial-analysis',
    name: 'Air Quality Spatial Analysis',
    description:
      'Map-first exploration of pollutant readings across Africa using interactive geospatial views.',
    category: 'Spatial Analysis',
    apis: ['Map Readings'],
    parameterised: false,
  },
  {
    id: 'who-exceedance-report',
    name: 'WHO Exceedance Report',
    description:
      'Compliance-focused reporting on how often sites exceed WHO air quality guidelines.',
    category: 'Reporting',
    apis: ['Chart Data'],
    parameterised: true,
  },
];

export default function DataAppAboutPage({ params }: { params: { id: string } }) {
  const app = useMemo(
    () => pilotApps.find(item => item.id === params.id),
    [params.id]
  );

  if (!app) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
        App details will be loaded from the App Registry in Phase 2.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {app.category}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-heading">{app.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{app.description}</p>
          </div>
          <ReusableButton asChild>
            <Link href={`/data-apps/${app.id}`}>Open Data App</Link>
          </ReusableButton>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-heading">APIs used</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {app.apis.map(api => (
            <span
              key={api}
              className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground"
            >
              {api}
            </span>
          ))}
        </div>
        {app.parameterised && (
          <p className="mt-4 text-sm text-muted-foreground">
            This app accepts data from AirQo Analytics via the Export to Data App flow.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
        YouTube tutorial embed and full metadata will appear here once the App Registry API is
        connected.
      </section>
    </div>
  );
}
