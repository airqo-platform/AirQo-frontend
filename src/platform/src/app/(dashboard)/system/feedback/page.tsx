'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
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
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
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
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'archived', label: 'Archived' },
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

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
      return matchesStatus && matchesCategory;
    });
  }, [categoryFilter, feedbacks, statusFilter]);

  const tableData = useMemo<FeedbackRow[]>(
    () =>
      filteredFeedbacks.map(feedback => ({
        ...feedback,
        id: feedback._id,
      })),
    [filteredFeedbacks]
  );

  const statusCounts = useMemo(() => {
    return feedbacks.reduce(
      (counts, feedback) => {
        counts.total += 1;
        if (feedback.status === 'pending') counts.pending += 1;
        if (feedback.status === 'reviewed') counts.reviewed += 1;
        if (feedback.status === 'resolved') counts.resolved += 1;
        if (feedback.status === 'archived') counts.archived += 1;
        return counts;
      },
      { total: 0, pending: 0, reviewed: 0, resolved: 0, archived: 0 }
    );
  }, [feedbacks]);

  const handleViewFeedback = useCallback(
    (feedbackId: string) => {
      router.push(`/system/feedback/${feedbackId}`);
    },
    [router]
  );

  const columns = useMemo(
    () => [
      {
        key: 'subject',
        label: 'Subject',
        render: (_value: unknown, item: FeedbackRow) => (
          <div className="space-y-1">
            <p className="font-medium text-foreground">{item.subject}</p>
            <p className="max-w-xl text-sm text-muted-foreground line-clamp-2">
              {item.message}
            </p>
          </div>
        ),
      },
      {
        key: 'category',
        label: 'Category',
        render: (value: unknown) => (
          <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize text-foreground">
            {CATEGORY_LABELS[String(value)] || String(value)}
          </span>
        ),
      },
      {
        key: 'status',
        label: 'Status',
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
        render: (value: unknown) => (
          <span className="text-sm font-medium text-foreground">
            {value as number}/5
          </span>
        ),
      },
      {
        key: 'email',
        label: 'Email',
        render: (value: unknown) => (
          <span className="text-sm text-muted-foreground">{String(value)}</span>
        ),
      },
      {
        key: 'createdAt',
        label: 'Submitted',
        render: (value: unknown) => (
          <span className="text-sm text-muted-foreground">
            {formatDateTime(String(value))}
          </span>
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
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
        subtitle="Review user-reported bugs, feature requests, praise, and support messages."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <div className="grid gap-4 md:grid-cols-2">
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
      </div>

      <ServerSideTable
        title="Feedback submissions"
        data={tableData}
        columns={columns}
        loading={false}
        showClientPagination={true}
        compactRows={false}
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
