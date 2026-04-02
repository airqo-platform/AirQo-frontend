'use client';

import Link from 'next/link';
import ReusableButton from '@/components/shared/button/ReusableButton';

export default function GettingStartedPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold text-heading">Getting Started</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          AirQo Data Apps are built with Observable Framework and published via GitHub-connected
          builds. Follow these steps to get your first app live.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <ReusableButton asChild>
            <Link href="/login?callbackUrl=/publish">Start Publishing</Link>
          </ReusableButton>
          <ReusableButton variant="outlined" asChild>
            <Link href="/login?callbackUrl=/data-apps">Browse Data Apps</Link>
          </ReusableButton>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-heading">1. Fork the template</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Start from the AirQo Observable Framework template repo. It includes a working
            `index.md`, the `airqo.js` loader, and a sample `.airqo/manifest.json`.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Run `npm install` and `npm run dev` locally to preview your app.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-heading">2. Complete the manifest</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Every app must include `.airqo/manifest.json` with metadata: app name, version,
            description (100–1000 chars), YouTube tutorial URL, APIs used, and parameterisation
            details.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            The build pipeline validates required fields and rejects invalid YouTube URLs.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-heading">3. Connect GitHub</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Use the Publish flow to connect your GitHub repo. We&apos;ll validate the manifest
            before registering the app and enabling auto-deploys.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-heading">4. Push to deploy</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Every push to your default branch triggers a secure build. The pipeline runs safety
            checks, builds the Observable app, and deploys the static output to AirQo storage.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-heading">Analytics Export Integration</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Parameterised apps can receive data context from AirQo Analytics. Use `urlParams()` in
          `airqo.js` to read `siteId`, `startDate`, `endDate`, and `pollutant` from the URL.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          If parameters are missing, your app should gracefully fall back to user controls.
        </p>
      </section>

      <section className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
        <h3 className="text-lg font-semibold text-heading">Need help?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Start with the template, then follow the Publish flow when you&apos;re ready.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <ReusableButton asChild>
            <Link href="/login?callbackUrl=/publish">Start Publishing</Link>
          </ReusableButton>
          <ReusableButton variant="text" asChild>
            <Link href="/">Back to Home</Link>
          </ReusableButton>
        </div>
      </section>
    </div>
  );
}
