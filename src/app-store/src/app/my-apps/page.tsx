'use client';

import { appRegistry } from '@airqo/app-store-modules';
import { AppCard } from '@/components/app-card';
import { useInstalledApps } from '@/lib/use-installed-apps';

export default function MyAppsPage() {
  const { installedIds } = useInstalledApps();
  const installedApps = appRegistry
    .map(entry => entry.manifest)
    .filter(app => installedIds.includes(app.id));

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold text-heading">My Apps</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Apps installed in your AirQo Analytics workspace.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {installedApps.map(app => (
          <AppCard key={app.id} app={app} isInstalled />
        ))}
        {installedApps.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            You have not installed any apps yet.
          </div>
        )}
      </section>
    </div>
  );
}
