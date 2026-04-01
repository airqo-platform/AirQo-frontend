'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockApps } from '@airqo/app-store-types';
import { useInstalledApps } from '@/lib/use-installed-apps';

export default function AppDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { installedIds, install, uninstall } = useInstalledApps();

  const app = useMemo(() => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    return mockApps.find(item => item.id === id);
  }, [params.id]);

  if (!app) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        App not found.{' '}
        <button
          onClick={() => router.push('/')}
          className="text-primary hover:underline"
        >
          Return to browse
        </button>
      </div>
    );
  }

  const isInstalled = installedIds.includes(app.id);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {app.category}
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-heading">{app.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{app.description}</p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => (isInstalled ? uninstall(app.id) : install(app.id))}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                isInstalled
                  ? 'bg-destructive text-destructive-foreground'
                  : 'bg-primary text-primary-foreground'
              }`}
            >
              {isInstalled ? 'Uninstall' : 'Install'}
            </button>
            <span className="text-xs text-muted-foreground">
              Version {app.version}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-heading">Permissions</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {app.permissions.map(permission => (
              <span
                key={permission}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
              >
                {permission}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-heading">API Access</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {app.apis.map(api => (
              <span
                key={api}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
              >
                {api}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}