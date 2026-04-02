export default function UsagePage() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold text-heading">Usage</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track app usage metrics and engagement once analytics are connected.
        </p>
      </div>
      <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
        Metrics integration will appear here.
      </div>
    </div>
  );
}