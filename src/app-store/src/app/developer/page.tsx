import Link from 'next/link';

export default function DeveloperPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold text-heading">Developer Portal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Submit new apps, manage versions, and track review status.
        </p>
      </section>

      <section className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
        Submission flow will be wired to the backend registry. For now, use the
        mock manifest template and keep building.
        <div className="mt-3">
          <Link href="/" className="text-primary hover:underline">
            Back to Browse
          </Link>
        </div>
      </section>
    </div>
  );
}