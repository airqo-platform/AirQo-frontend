'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { appRegistry } from '@airqo/app-store-modules';
import { useInstalledApps } from '@/lib/use-installed-apps';
import ReusableButton from '@/components/shared/button/ReusableButton';
import ReusableToast from '@/components/shared/toast/ReusableToast';

export default function AppDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { installedIds, install, uninstall } = useInstalledApps();

  const app = useMemo(() => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    return appRegistry.map(entry => entry.manifest).find(item => item.id === id);
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
  const isAuthenticated = !!session;

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
            {!isAuthenticated && (
              <ReusableButton
                type="button"
                className="rounded-full px-5 py-2"
                onClick={() =>
                  router.push(`/login?callbackUrl=/apps/${app.id}`)
                }
              >
                Login to install
              </ReusableButton>
            )}
            {isAuthenticated && (
              <ReusableButton
                type="button"
                className="rounded-full px-5 py-2"
                variant={isInstalled ? 'outlined' : 'filled'}
                onClick={() => {
                  if (isInstalled) {
                    uninstall(app.id);
                    ReusableToast({
                      message: `${app.name} uninstalled`,
                      type: 'INFO',
                    });
                  } else {
                    install(app.id);
                    ReusableToast({
                      message: `${app.name} installed`,
                      type: 'SUCCESS',
                    });
                  }
                }}
              >
                {isInstalled ? 'Uninstall' : 'Install'}
              </ReusableButton>
            )}
            <span className="text-xs text-muted-foreground">
              Version {app.version}
            </span>
          </div>
        </div>
      </section>

      {app.runtime === 'iframe' && app.hostedUrl && (
        <section className="rounded-2xl border border-border bg-card p-4">
          <iframe
            title={app.name}
            src={app.hostedUrl}
            className="h-[420px] w-full rounded-xl border border-border"
            sandbox="allow-scripts allow-same-origin"
          />
        </section>
      )}

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
