'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useSWR, { useSWRConfig } from 'swr';
import { PermissionGuard } from '@/shared/components';
import {
  Button,
  Card,
  PageHeading,
  Select,
  LoadingState,
} from '@/shared/components/ui';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { AqEye } from '@airqo/icons-react';
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
  reviewed:
    'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
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
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'archived', label: 'Archived' },
];

const APP_OPTIONS = [
  { value: 'all', label: 'All apps' },
  { value: 'Analytics', label: 'Analytics' },
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

const FeedbackListContent: React.FC = () => {
  const router = useRouter();
  const { mutate: globalMutate } = useSWRConfig();
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [appFilter, setAppFilter] = useState('all');
  const [actionableFilter, setActionableFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('reviewed');

  const fetchAllFeedbacks = async (opts: {
    status?: string | null;
    category?: string | null;
  }) => {
    const limit = 100;
    let page = 1;
    let all: FeedbackSubmission[] = [];
    while (true) {
      const res = await feedbackService.getFeedbackSubmissions({
        page,
        limit,
        status: opts.status || undefined,
        category: opts.category || undefined,
      });
      all = all.concat(res.feedbacks || []);
      const pages = res.meta?.pages ?? 1;
      if (page >= pages) break;
      page += 1;
    }
    return { feedbacks: all };
  };

  const { data, error, isLoading } = useSWR(
    ['feedback/submissions', statusFilter, categoryFilter],
    async () => {
      const status = statusFilter === 'all' ? null : statusFilter;
      const category = categoryFilter === 'all' ? null : categoryFilter;
      return fetchAllFeedbacks({ status, category });
    },
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const feedbacks = useMemo(() => data?.feedbacks || [], [data?.feedbacks]);

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(feedback => {
      const matchesStatus =
        statusFilter === 'all' || feedback.status === statusFilter;
      const matchesCategory =
        categoryFilter === 'all' || feedback.category === categoryFilter;
      const matchesApp = appFilter === 'all' || feedback.app === appFilter;
      const matchesActionable =
        actionableFilter === 'all' ||
        String(feedback.actionable ?? false) === actionableFilter;
      return matchesStatus && matchesCategory && matchesApp && matchesActionable;
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

  const statusCounts = useMemo(() => {
    return filteredFeedbacks.reduce(
      (counts, feedback) => {
        counts.total += 1;
        if (feedback.status === 'pending') counts.pending += 1;
        if (feedback.status === 'reviewed') counts.reviewed += 1;
        if (feedback.status === 'resolved') counts.resolved += 1;
        if (feedback.status === 'archived') counts.archived += 1;
        if (feedback.actionable) counts.actionable += 1;
        return counts;
      },
      {
        total: 0,
        pending: 0,
        reviewed: 0,
        resolved: 0,
        archived: 0,
        actionable: 0,
      }
    );
  }, [filteredFeedbacks]);

  const handleViewFeedback = useCallback(
    (feedbackId: string) => {
      router.push(`/system/feedback/${feedbackId}`);
    },
    [router]
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
        toast.error(
          `${summary.succeeded} updated, ${summary.failed} failed`
        );
      } else {
        toast.success(
          `${summary.succeeded} feedback items updated to ${getStatusLabel(bulkStatus)}`
        );
      }

      setSelectedIds(new Set());
      try {
        await globalMutate('feedback/submissions');
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
        minWidth: '240px',
        maxWidth: '360px',
        render: (_value: unknown, item: FeedbackRow) => (
          <div className="flex items-center gap-2">
            <p
              className="font-medium text-foreground truncate"
              title={item.subject}
            >
              {item.subject}
            </p>
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
        minWidth: '140px',
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
        minWidth: '120px',
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
        minWidth: '90px',
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
        minWidth: '220px',
        maxWidth: '280px',
        cellClassName: 'whitespace-nowrap',
        render: (value: unknown) => (
          <span
            className="block truncate text-sm text-muted-foreground"
            title={String(value)}
          >
            {String(value)}
          </span>
        ),
      },
      {
        key: 'createdAt',
        label: 'Submitted',
        minWidth: '190px',
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
      {
        key: 'actions',
        label: 'Actions',
        minWidth: '96px',
        cellClassName: 'whitespace-nowrap',
        render: (_value: unknown, item: FeedbackRow) => (
          <Button
            variant="ghost"
            paddingStyles="h-8 px-3"
            Icon={AqEye}
            iconPosition="start"
            onClick={() => handleViewFeedback(item._id)}
            aria-label={`View feedback ${item.subject}`}
          >
            View
          </Button>
        ),
      },
    ],
    [handleViewFeedback]
  );

  const summaryCards = [
    {
      title: 'Total',
      value: statusCounts.total,
      description: 'All feedback submissions',
    },
    {
      title: 'Actionable',
      value: statusCounts.actionable,
      description: 'Require follow-up',
    },
    {
      title: 'Pending',
      value: statusCounts.pending,
      description: 'Need review',
    },
    {
      title: 'Reviewed',
      value: statusCounts.reviewed,
      description: 'Seen by the team',
    },
    {
      title: 'Resolved',
      value: statusCounts.resolved,
      description: 'Closed out',
    },
    {
      title: 'Archived',
      value: statusCounts.archived,
      description: 'Hidden from active lists',
    },
  ];

  return isLoading ? (
    <LoadingState
      className="min-h-[400px]"
      text="Loading feedback submissions..."
    />
  ) : isForbiddenError(error) ? (
    <AccessDenied
      title="Access Denied"
      message="You do not have the required permissions to view feedback submissions."
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
              {card.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {card.description}
            </p>
          </Card>
        ))}
      </div>

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
        onSelectedItemsChange={ids =>
          setSelectedIds(new Set(ids.map(String)))
        }
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
