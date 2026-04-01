import { AirQoAppProps } from '@airqo/app-store-modules';

export default function PM25HeatmapApp({ user }: AirQoAppProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-heading">PM2.5 Heatmap</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Welcome {user.name}. This internal app will render the interactive
        heatmap once the data layer is wired.
      </p>
    </div>
  );
}
