'use client';

import React, { useMemo, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR, { useSWRConfig } from 'swr';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAbortableFetcher } from '@/shared/hooks/useAbortableSWR';
import { isAbortError } from '@/shared/lib/retryPolicy';
import { PermissionGuard } from '@/shared/components';
import {
  Button,
  Card,
  PageHeading,
  Select,
  LoadingState,
} from '@/shared/components/ui';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { feedbackService } from '@/modules/feedback';
import { toast } from '@/shared/components/ui/toast';
import {
  getUserFriendlyErrorMessage,
  isForbiddenError,
} from '@/shared/utils/errorMessages';
import { AccessDenied } from '@/shared/components/AccessDenied';
import type { FeedbackSubmission } from '@/shared/types/api';

type FeedbackRow = FeedbackSubmission & {
  id: string;
  [key: string]: unknown;
};

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  bug: 'Bug',
  feature_request: 'Feature request',
  performance: 'Performance',
  ux_design: 'UX / Design',
  other: 'Other',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  reviewed: 'Reviewed',
  resolved: 'Resolved',
  archived: 'Archived',
};

const STATUS_STYLES: Record<string, string> = {
  pending:
    'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  reviewed: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
  resolved:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  archived:
    'bg-slate-100 text-slate-800 dark:bg-slate-950/40 dark:text-slate-300',
};

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All categories' },
  { value: 'general', label: 'General' },
  { value: 'bug', label: 'Bug' },
  { value: 'feature_request', label: 'Feature request' },
  { value: 'performance', label: 'Performance' },
  { value: 'ux_design', label: 'UX / Design' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open (Pending + Reviewed)' },
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'archived', label: 'Archived' },
];

const APP_OPTIONS = [
  { value: 'all', label: 'All apps' },
  { value: 'Nexus', label: 'Nexus' },
  { value: 'beacon', label: 'beacon' },
  { value: 'vertex', label: 'vertex' },
];

const ACTIONABLE_OPTIONS = [
  { value: 'all', label: 'All items' },
  { value: 'true', label: 'Actionable' },
  { value: 'false', label: 'Not actionable' },
];

const BULK_STATUS_OPTIONS = [
  { value: 'reviewed', label: 'Mark as Reviewed' },
  { value: 'resolved', label: 'Mark as Resolved' },
  { value: 'archived', label: 'Mark as Archived' },
];

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const getStatusLabel = (status: string) => STATUS_LABELS[status] || status;

const formatRate = (value?: number | null) =>
  value == null ? '—' : `${value}%`;

const formatRating = (value?: number | null) =>
  value == null ? '—' : `${value.toFixed(1)}/5`;

const formatDay = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const FeedbackListContent: React.FC = () => {
  const router = useRouter();
  const { mutate: globalMutate } = useSWRConfig();
  const [statusFilter, setStatusFilter] = useState('open');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [appFilter, setAppFilter] = useState('all');
  const [actionableFilter, setActionableFilter] = useState('true');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('reviewed');

  const fetchAllFeedbacks = useCallback(
    async (
      opts: { status?: string | null; category?: string | null },
      signal: AbortSignal
    ) => {
      const limit = 100;
      let page = 1;
      let all: FeedbackSubmission[] = [];
      while (true) {
        const res = await feedbackService.getFeedbackSubmissions(
          {
            page,
            limit,
            status: opts.status || undefined,
            category: opts.category || undefined,
          },
          signal
        );
        all = all.concat(res.feedbacks || []);
        const pages = res.meta?.pages ?? 1;
        if (page >= pages) break;
        page += 1;
      }
      return { feedbacks: all };
    },
    []
  );

  const listFetcher = useCallback(
    (signal: AbortSignal) => {
      const status = statusFilter === 'all' ? null : statusFilter;
      const listStatus = status === 'open' ? null : status;
      const category = categoryFilter === 'all' ? null : categoryFilter;
      return fetchAllFeedbacks({ status: listStatus, category }, signal);
    },
    [categoryFilter, fetchAllFeedbacks, statusFilter]
  );
  const { fetcher: fetchFeedbackList } = useAbortableFetcher(listFetcher);

  const {
    data,
    error: submissionError,
    isLoading,
  } = useSWR(
    ['feedback/submissions', statusFilter, categoryFilter],
    fetchFeedbackList,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const statsFetcher = useCallback(
    (signal: AbortSignal) =>
      feedbackService.getFeedbackStats(
        { app: appFilter === 'all' ? undefined : appFilter },
        signal
      ),
    [appFilter]
  );
  const { fetcher: fetchFeedbackStats } = useAbortableFetcher(statsFetcher);

  const {
    data: stats,
    error: rawStatsError,
    isLoading: statsLoading,
  } = useSWR(['feedback/stats', appFilter], fetchFeedbackStats, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    errorRetryCount: 0,
  });

  const error = isAbortError(submissionError) ? undefined : submissionError;
  const statsError = isAbortError(rawStatsError) ? undefined : rawStatsError;

  const feedbacks = useMemo(() => data?.feedbacks || [], [data?.feedbacks]);

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(feedback => {
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'open'
          ? feedback.status === 'pending' || feedback.status === 'reviewed'
          : feedback.status === statusFilter);
      const matchesCategory =
        categoryFilter === 'all' || feedback.category === categoryFilter;
      const matchesApp = appFilter === 'all' || feedback.app === appFilter;
      const matchesActionable =
        actionableFilter === 'all' ||
        String(feedback.actionable ?? false) === actionableFilter;
      return (
        matchesStatus && matchesCategory && matchesApp && matchesActionable
      );
    });
  }, [appFilter, categoryFilter, feedbacks, statusFilter, actionableFilter]);

  const tableData = useMemo<FeedbackRow[]>(
    () =>
      filteredFeedbacks.map(feedback => ({
        ...feedback,
        id: feedback._id,
      })),
    [filteredFeedbacks]
  );

  useEffect(() => {
    const visibleIds = new Set(tableData.map(row => row.id));
    setSelectedIds(prev => {
      const next = new Set(Array.from(prev).filter(id => visibleIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [tableData]);

  const handleViewFeedback = useCallback(
    (feedbackId: string) => {
      router.push(`/system/feedback/${feedbackId}`);
    },
    [router]
  );

  // `FeedbackRow.id` is the submission `_id`, normalised when the rows are
  // built so the table can key on it.
  const handleViewFeedbackRow = useCallback(
    (item: FeedbackRow) => {
      handleViewFeedback(item.id);
    },
    [handleViewFeedback]
  );

  const handleBulkStatusUpdate = useCallback(async () => {
    if (selectedIds.size === 0) return;

    setIsBulkUpdating(true);
    try {
      const result = await feedbackService.bulkUpdateStatus({
        feedback_ids: Array.from(selectedIds),
        status: bulkStatus,
      });

      const { summary } = result.data;
      if (summary.failed > 0) {
        toast.error(`${summary.succeeded} updated, ${summary.failed} failed`);
      } else {
        toast.success(
          `${summary.succeeded} feedback items updated to ${getStatusLabel(bulkStatus)}`
        );
      }

      setSelectedIds(new Set());
      try {
        await globalMutate(
          (key: unknown) =>
            Array.isArray(key) &&
            (key[0] === 'feedback/submissions' || key[0] === 'feedback/stats')
        );
      } catch {
        // swallow
      }
    } catch (updateError) {
      toast.error(getUserFriendlyErrorMessage(updateError));
    } finally {
      setIsBulkUpdating(false);
    }
  }, [selectedIds, bulkStatus, globalMutate]);

  const columns = useMemo(
    () => [
      {
        key: 'subject',
        label: 'Subject',
        minWidth: '220px',
        maxWidth: '320px',
        render: (_value: unknown, item: FeedbackRow) => (
          <div className="flex items-center gap-2">
            {/* A real link, not just a clickable row: it keeps the row
                keyboard-reachable and supports open-in-new-tab, which a
                <tr onClick> does not. The row click is suppressed for
                interactive targets by the table. */}
            <Link
              href={`/system/feedback/${item.id}`}
              className="font-medium text-foreground truncate hover:underline"
              title={item.subject}
            >
              {item.subject}
            </Link>
            {item.actionable && (
              <span className="inline-flex shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                Actionable
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'category',
        label: 'Category',
        minWidth: '130px',
        cellClassName: 'whitespace-nowrap',
        render: (value: unknown) => (
          <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize text-foreground">
            {CATEGORY_LABELS[String(value)] || String(value)}
          </span>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        minWidth: '110px',
        cellClassName: 'whitespace-nowrap',
        render: (value: unknown) => (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
              STATUS_STYLES[String(value)] || 'bg-muted text-foreground'
            }`}
          >
            {getStatusLabel(String(value))}
          </span>
        ),
      },
      {
        key: 'rating',
        label: 'Rating',
        minWidth: '80px',
        cellClassName: 'whitespace-nowrap',
        render: (value: unknown) => (
          <span className="text-sm font-medium text-foreground">
            {value as number}/5
          </span>
        ),
      },
      {
        key: 'email',
        label: 'Email',
        minWidth: '200px',
        maxWidth: '240px',
        cellClassName: 'whitespace-nowrap',
        render: (value: unknown, item: FeedbackRow) => (
          <div className="flex items-center gap-2">
            <span
              className="block max-w-[180px] truncate text-sm text-muted-foreground"
              title={String(value)}
            >
              {String(value)}
            </span>
            {item.contact_consent === false && (
              <span className="inline-flex shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                No contact
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'createdAt',
        label: 'Submitted',
        minWidth: '180px',
        cellClassName: 'whitespace-nowrap',
        render: (_value: unknown, item: FeedbackRow) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-muted-foreground">
              {formatDateTime(String(_value))}
            </span>
            {item.reminderCount != null && item.reminderCount > 0 && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400">
                Reminded {item.reminderCount}×
              </span>
            )}
          </div>
        ),
      },
      // No per-row "View" action: it was the widest fixed column and pushed
      // itself off-screen behind a horizontal scrollbar. The whole row is
      // clickable and the subject is a link instead.
    ],
    []
  );

  const summaryCards = [
    {
      title: 'Open actionable',
      value: stats?.feedback.open_actionable,
      description: 'Pending or reviewed and needs follow-up',
    },
    {
      title: 'Stale',
      value: stats?.feedback.stale_actionable,
      description: `Pending over ${stats?.feedback.stale_threshold_days ?? '—'} days`,
    },
    {
      title: 'Unassigned open',
      value: stats?.feedback.unassigned_open,
      description: 'Open items without an owner',
    },
    {
      title: 'Resolution rate',
      value: formatRate(stats?.feedback.resolution_rate),
      description: 'Resolved as a share of all feedback',
    },
    {
      title: 'Reply rate',
      value: formatRate(stats?.feedback.reply_rate),
      description: 'Items with at least one admin reply',
    },
  ];

  if (isForbiddenError(error) || isForbiddenError(statsError)) {
    return (
      <AccessDenied
        title="Access Denied"
        message="You do not have the required permissions to view feedback submissions."
      />
    );
  }

  return isLoading ? (
    <LoadingState
      className="min-h-[400px]"
      text="Loading feedback submissions..."
    />
  ) : error ? (
    <Card className="p-6">
      <p className="text-sm text-muted-foreground">
        {getUserFriendlyErrorMessage(error)}
      </p>
    </Card>
  ) : (
    <div className="space-y-6">
      <PageHeading
        title="Feedback"
        subtitle="Review user-flagged bugs, feature requests, praise, and support messages."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map(card => (
          <Card key={card.title} className="p-4">
            <p className="text-sm text-muted-foreground">{card.title}</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {statsLoading ? '…' : statsError ? '—' : (card.value ?? '—')}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {card.description}
            </p>
          </Card>
        ))}
      </div>

      {statsError ? (
        <p className="text-sm text-muted-foreground" role="status">
          Feedback metrics could not be loaded:{' '}
          {getUserFriendlyErrorMessage(statsError)}
        </p>
      ) : null}

      <section
        aria-labelledby="page-satisfaction-heading"
        className="space-y-4"
      >
        <div>
          <h2
            id="page-satisfaction-heading"
            className="text-lg font-semibold text-foreground"
          >
            Satisfaction
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Page ratings are tracked separately from feedback items.
          </p>
        </div>

        {statsLoading ? (
          <Card className="p-6 text-sm text-muted-foreground">
            Loading satisfaction metrics…
          </Card>
        ) : statsError ? (
          <Card className="p-6 text-sm text-muted-foreground">
            Satisfaction metrics are unavailable right now.
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: 'Submissions',
                  value: stats?.page_satisfaction?.submissions ?? 0,
                },
                {
                  label: 'Average rating',
                  value: formatRating(stats?.page_satisfaction?.average_rating),
                },
                {
                  label: 'Satisfied',
                  value: formatRate(
                    stats?.page_satisfaction?.satisfaction_rate
                  ),
                },
              ].map(metric => (
                <Card key={metric.label} className="p-4">
                  <p className="text-sm text-muted-foreground">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {metric.value}
                  </p>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <Card className="p-4 xl:col-span-2">
                <h3 className="font-medium text-foreground">Daily trend</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Average rating and satisfaction rate by day
                </p>
                {stats?.page_satisfaction?.daily?.length ? (
                  <div
                    className="mt-4 h-[280px]"
                    aria-label="Satisfaction daily trend chart"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={stats.page_satisfaction.daily}
                        margin={{ top: 12, right: 12, bottom: 4, left: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="day"
                          tickFormatter={formatDay}
                          minTickGap={24}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis
                          yAxisId="rating"
                          domain={[0, 5]}
                          width={32}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis
                          yAxisId="satisfaction"
                          orientation="right"
                          domain={[0, 100]}
                          width={38}
                          tickFormatter={value => `${value}%`}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          labelFormatter={value => formatDay(String(value))}
                        />
                        <Legend />
                        <Line
                          yAxisId="rating"
                          type="monotone"
                          dataKey="average_rating"
                          name="Average rating"
                          stroke="#2563eb"
                          strokeWidth={2}
                          dot={false}
                          connectNulls={false}
                        />
                        <Line
                          yAxisId="satisfaction"
                          type="monotone"
                          dataKey="satisfaction_rate"
                          name="Satisfied"
                          stroke="#059669"
                          strokeWidth={2}
                          dot={false}
                          connectNulls={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="mt-8 text-sm text-muted-foreground">
                    No daily satisfaction ratings are available for this app.
                  </p>
                )}
              </Card>

              <Card className="p-4">
                <h3 className="font-medium text-foreground">
                  Lowest-rated pages
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pages with enough ratings to be ranked
                </p>
                {stats?.page_satisfaction?.lowest_rated_pages?.length ? (
                  <ul className="mt-4 divide-y divide-border">
                    {stats.page_satisfaction.lowest_rated_pages.map(
                      (page, index) => (
                        <li
                          key={`${page.app ?? 'app'}-${page.page ?? index}`}
                          className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {page.page || 'Unnamed page'}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {page.app || 'Unknown app'} ·{' '}
                              {page.rated_count ?? page.submissions ?? 0}{' '}
                              ratings
                            </p>
                          </div>
                          <span className="shrink-0 text-sm font-semibold text-foreground">
                            {formatRating(page.average_rating)}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="mt-6 text-sm text-muted-foreground">
                    No pages meet the minimum rating count yet.
                  </p>
                )}
              </Card>

              <Card className="p-4 xl:col-span-3">
                <h3 className="font-medium text-foreground">Ratings by app</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {stats?.page_satisfaction?.by_app?.length ? (
                    stats.page_satisfaction.by_app.map((app, index) => (
                      <div
                        key={`${app.app ?? 'app'}-${index}`}
                        className="flex items-center justify-between gap-4 rounded-md border p-3"
                      >
                        <div>
                          <p className="font-medium capitalize text-foreground">
                            {app.app || 'Unknown app'}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {app.rated_count ?? app.submissions ?? 0} ratings
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            {formatRating(app.average_rating)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatRate(app.satisfaction_rate)} satisfied
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Ratings by app are not available.
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <Select
          label="Status filter"
          value={statusFilter}
          onChange={event =>
            setStatusFilter(String(event.target.value || 'all'))
          }
          containerClassName="md:max-w-xs"
        >
          {STATUS_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Select
          label="Category filter"
          value={categoryFilter}
          onChange={event =>
            setCategoryFilter(String(event.target.value || 'all'))
          }
          containerClassName="md:max-w-xs"
        >
          {CATEGORY_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Select
          label="App filter"
          value={appFilter}
          onChange={event => setAppFilter(String(event.target.value || 'all'))}
          containerClassName="md:max-w-xs"
        >
          {APP_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Select
          label="Actionable filter"
          value={actionableFilter}
          onChange={event =>
            setActionableFilter(String(event.target.value || 'all'))
          }
          containerClassName="md:max-w-xs"
        >
          {ACTIONABLE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <Button
        variant="ghost"
        disabled={
          statusFilter === 'all' &&
          categoryFilter === 'all' &&
          appFilter === 'all' &&
          actionableFilter === 'all'
        }
        onClick={() => {
          setStatusFilter('all');
          setCategoryFilter('all');
          setAppFilter('all');
          setActionableFilter('all');
        }}
      >
        Clear filters
      </Button>

      {selectedIds.size > 0 && (
        <Card className="flex flex-wrap items-center gap-4 p-4">
          <span className="text-sm font-medium text-foreground">
            {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <Select
            label=""
            value={bulkStatus}
            onChange={event => setBulkStatus(String(event.target.value))}
            containerClassName="!mb-0 md:max-w-xs"
          >
            {BULK_STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Button
            loading={isBulkUpdating}
            onClick={() => void handleBulkStatusUpdate()}
          >
            Apply
          </Button>
          <Button
            variant="ghost"
            onClick={() => setSelectedIds(new Set())}
            disabled={isBulkUpdating}
          >
            Clear selection
          </Button>
        </Card>
      )}

      <ServerSideTable
        title="Feedback submissions"
        data={tableData}
        columns={columns}
        loading={false}
        showClientPagination={true}
        compactRows={false}
        multiSelect={true}
        selectedItems={Array.from(selectedIds)}
        onSelectedItemsChange={ids => setSelectedIds(new Set(ids.map(String)))}
        onRowClick={handleViewFeedbackRow}
      />
    </div>
  );
};

const FeedbackListPage: React.FC = () => {
  return (
    <PermissionGuard
      requiredPermissions={['SYSTEM_ADMIN', 'SUPER_ADMIN']}
      accessDeniedTitle="Access Restricted"
      accessDeniedMessage="You need system administration permissions to view feedback submissions."
    >
      <FeedbackListContent />
    </PermissionGuard>
  );
};

export default FeedbackListPage;
