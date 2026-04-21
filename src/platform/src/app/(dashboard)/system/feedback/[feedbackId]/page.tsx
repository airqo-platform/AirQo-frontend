'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR, { useSWRConfig } from 'swr';
import { PermissionGuard } from '@/shared/components';
import {
  Button,
  Card,
  PageHeading,
  LoadingState,
} from '@/shared/components/ui';
import { AqArrowLeft } from '@airqo/icons-react';
import { feedbackService } from '@/modules/feedback';
import { toast } from '@/shared/components/ui/toast';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import type { FeedbackSubmission } from '@/shared/types/api';

const STATUS_OPTIONS = ['pending', 'reviewed', 'resolved'] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  reviewed: 'Reviewed',
  resolved: 'Resolved',
};

const STATUS_STYLES: Record<string, string> = {
  pending:
    'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  reviewed: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
  resolved:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
};

const CATEGORY_LABELS: Record<string, string> = {
  bug: 'Bug',
  feature: 'Feature request',
  support: 'Support',
  praise: 'Praise',
  other: 'Other',
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const FeedbackDetailsPage: React.FC = () => {
  const params = useParams<{ feedbackId: string }>();
  const router = useRouter();
  const { mutate: globalMutate } = useSWRConfig();
  const feedbackId = params?.feedbackId;
  const [isUpdating, setIsUpdating] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  const {
    data,
    error,
    isLoading,
    mutate: refreshFeedback,
  } = useSWR(
    feedbackId ? `feedback/submissions/${feedbackId}` : null,
    () => feedbackService.getFeedbackSubmission(feedbackId),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      errorRetryCount: 0,
      dedupingInterval: 5000,
    }
  );

  const feedback = data?.feedback as FeedbackSubmission | undefined;

  useEffect(() => {
    if (!feedbackId) {
      router.push('/system/feedback');
    }
  }, [feedbackId, router]);

  const metadataEntries = useMemo(() => {
    if (!feedback?.metadata) {
      return [];
    }

    return [
      ['Page', feedback.metadata.page || '--'],
      ['Browser', feedback.metadata.browser || '--'],
      ['App version', feedback.metadata.appVersion || '--'],
      ['Screen resolution', feedback.metadata.screenResolution || '--'],
    ] as Array<[string, string]>;
  }, [feedback?.metadata]);

  const handleBack = () => {
    router.push('/system/feedback');
  };

  const handleUpdateStatus = async (status: string) => {
    if (!feedbackId || !feedback) {
      return;
    }

    setIsUpdating(true);
    setPendingStatus(status);
    try {
      await feedbackService.updateFeedbackStatus(feedbackId, status);
      toast.success('Feedback status updated successfully');
      await Promise.all([
        refreshFeedback(),
        globalMutate('feedback/submissions'),
      ]);
    } catch (updateError) {
      toast.error(getUserFriendlyErrorMessage(updateError));
    } finally {
      setIsUpdating(false);
      setPendingStatus(null);
    }
  };

  return (
    <PermissionGuard
      requiredPermissions={['SYSTEM_ADMIN', 'SUPER_ADMIN']}
      accessDeniedTitle="Access Restricted"
      accessDeniedMessage="You need system administration permissions to review feedback submissions."
    >
      {isLoading ? (
        <LoadingState
          className="min-h-[400px]"
          text="Loading feedback details..."
        />
      ) : error || !feedback ? (
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">
            {error
              ? getUserFriendlyErrorMessage(error)
              : 'Feedback submission not found.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-start">
            <Button
              variant="ghost"
              Icon={AqArrowLeft}
              iconPosition="start"
              onClick={handleBack}
            >
              Back to feedback
            </Button>
          </div>

          <PageHeading
            title={feedback.subject}
            subtitle={`Submitted by ${feedback.email} on ${formatDateTime(feedback.createdAt)}`}
          />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Current status
                    </p>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${
                        STATUS_STYLES[feedback.status] ||
                        'bg-muted text-foreground'
                      }`}
                    >
                      {STATUS_LABELS[feedback.status] || feedback.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map(status => (
                      <Button
                        key={status}
                        variant={
                          feedback.status === status ? 'filled' : 'outlined'
                        }
                        loading={isUpdating && pendingStatus === status}
                        disabled={isUpdating && feedback.status !== status}
                        onClick={() => void handleUpdateStatus(status)}
                      >
                        {STATUS_LABELS[status]}
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Message
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                      {feedback.message}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Category
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {CATEGORY_LABELS[feedback.category] ||
                          feedback.category}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Platform
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {feedback.platform}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Rating
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {feedback.rating}/5
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Tenant
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {feedback.tenant || '--'}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Reporter
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {feedback.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Created
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {formatDateTime(feedback.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Updated
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {formatDateTime(feedback.updatedAt)}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="space-y-4">
                  <p className="text-sm font-medium text-foreground">
                    Metadata
                  </p>
                  <div className="space-y-3">
                    {metadataEntries.length > 0 ? (
                      metadataEntries.map(([label, value]) => (
                        <div
                          key={label}
                          className="flex items-start justify-between gap-3"
                        >
                          <span className="text-xs uppercase tracking-wide text-muted-foreground">
                            {label}
                          </span>
                          <span className="text-right text-sm text-foreground">
                            {value}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No metadata was included with this submission.
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </PermissionGuard>
  );
};

export default FeedbackDetailsPage;
