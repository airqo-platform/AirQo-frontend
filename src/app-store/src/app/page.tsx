'use client';

import { useMemo, useState } from 'react';
import { appRegistry } from '@airqo/app-store-modules';
import { AppCard } from '@/components/app-card';
import { useInstalledApps } from '@/lib/use-installed-apps';

export default function BrowsePage() {
  const [search, setSearch] = useState('');
  const { installedIds } = useInstalledApps();

  const filteredApps = useMemo(() => {
    const query = search.trim().toLowerCase();
    const apps = appRegistry.map(entry => entry.manifest);
    if (!query) return apps;
    return apps.filter(app =>
      [app.name, app.description, app.category].some(value =>
        value.toLowerCase().includes(query)
      )
    );
  }, [search]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-heading">
              Browse AirQo Apps
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Discover vetted extensions built for the AirQo Analytics platform.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {installedIds.length} installed
          </div>
        </div>
        <div className="mt-4">
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search apps, categories, or capabilities..."
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {filteredApps.map(app => (
          <AppCard
            key={app.id}
            app={app}
            isInstalled={installedIds.includes(app.id)}
          />
        ))}
        {filteredApps.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No apps match your search yet.
          </div>
        )}
      </section>
    </div>
  );
}
