import Link from 'next/link';
import { AppManifest } from '@airqo/app-store-types';

interface AppCardProps {
  app: AppManifest;
  isInstalled?: boolean;
}

export function AppCard({ app, isInstalled }: AppCardProps) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {app.category}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-heading">{app.name}</h3>
        </div>
        {isInstalled && (
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
            Installed
          </span>
        )}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{app.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {app.apis.map(api => (
          <span
            key={api}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
          >
            {api}
          </span>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">v{app.version}</p>
        <Link
          href={`/apps/${app.id}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          View details
        </Link>
      </div>
    </div>
  );
}