import Link from 'next/link';
import ReusableButton from '@/components/shared/button/ReusableButton';

type SubmissionStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Update Under Review'
  | 'Rejected';

const mockApps: Array<{
  id: string;
  name: string;
  version: string;
  status: SubmissionStatus;
  lastUpdated: string;
}> = [
  {
    id: 'pm25-heatmap',
    name: 'PM2.5 Heatmap',
    version: '1.0.0',
    status: 'Approved',
    lastUpdated: 'Mar 30, 2026',
  },
  {
    id: 'pm25-heatmap',
    name: 'PM2.5 Heatmap',
    version: '1.1.0',
    status: 'Update Under Review',
    lastUpdated: 'Apr 1, 2026',
  },
];

const getStatusStyles = (status: SubmissionStatus) => {
  switch (status) {
    case 'Approved':
      return 'bg-emerald-500/10 text-emerald-600';
    case 'Under Review':
    case 'Update Under Review':
      return 'bg-amber-500/10 text-amber-600';
    case 'Rejected':
      return 'bg-rose-500/10 text-rose-600';
    case 'Submitted':
      return 'bg-blue-500/10 text-blue-600';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export default function DeveloperPage() {
  const hasApps = mockApps.length > 0;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold text-heading">Developer Portal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Submit new apps, manage versions, and track review status.
        </p>
      </section>

      {hasApps ? (
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-heading">Your Submissions</h2>
              <p className="text-sm text-muted-foreground">
                Track submission status and review outcomes for every release.
              </p>
            </div>
            <ReusableButton asChild>
              <Link href="/developer/submit">Submit an App</Link>
            </ReusableButton>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">App</th>
                  <th className="px-4 py-3 font-medium">Version</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Last Updated</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {mockApps.map(app => (
                  <tr key={`${app.id}-${app.version}`} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{app.name}</div>
                      <div className="text-xs text-muted-foreground">ID: {app.id}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{app.version}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyles(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{app.lastUpdated}</td>
                    <td className="px-4 py-3">
                      <Link href={`/developer/apps/${app.id}`} className="text-primary hover:underline">
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Updates are queued for admin review before they can be approved and published.
          </p>
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
          <h2 className="text-lg font-semibold text-heading">No submissions yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Submit your first app to start tracking review status and release updates.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <ReusableButton asChild>
              <Link href="/developer/submit">Submit an App</Link>
            </ReusableButton>
            <Link href="/" className="text-sm text-primary hover:underline">
              Back to Browse
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
