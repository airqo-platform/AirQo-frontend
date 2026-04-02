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

export default function LandingPage() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-border bg-card p-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              AirQo Data Apps
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-heading md:text-5xl">
              Publish. Share. Analyse.
            </h1>
            <p className="mt-4 text-base text-muted-foreground">
              A data science workspace where researchers publish interactive analyses built on
              live AirQo air quality data. Powered by Observable Framework and secured by AirQo
              SSO.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ReusableButton asChild>
                <Link href="/login?callbackUrl=/publish">Start Publishing</Link>
              </ReusableButton>
              <ReusableButton variant="outlined" asChild>
                <Link href="/login?callbackUrl=/data-apps">Browse Data Apps</Link>
              </ReusableButton>
              <ReusableButton variant="text" asChild>
                <Link href="/docs/getting-started">Getting Started</Link>
              </ReusableButton>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="rounded-full border border-border bg-background px-3 py-1">
                Observable Framework
              </div>
              <div className="rounded-full border border-border bg-background px-3 py-1">
                GitHub-connected builds
              </div>
              <div className="rounded-full border border-border bg-background px-3 py-1">
                Live AirQo data
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-muted/30 p-6">
            <h2 className="text-lg font-semibold text-heading">Built for data scientists</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>Publish Markdown-first, reactive data apps.</li>
              <li>Auto-deploy on every GitHub push.</li>
              <li>Share secure, authenticated URLs with stakeholders.</li>
              <li>Export analytics data straight into your app.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-heading">Pilot Data Apps</h2>
          <Link href="/login?callbackUrl=/data-apps" className="text-sm font-semibold text-primary hover:underline">
            View catalogue
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {pilotApps.map(app => (
            <div key={app.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {app.category}
              </div>
              <h3 className="mt-2 text-lg font-semibold text-heading">{app.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{app.description}</p>
              <div className="mt-4 text-xs text-muted-foreground">
                YouTube tutorial required on publish
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
